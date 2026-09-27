package com.nafiz.focusphone;

import android.app.AppOpsManager;
import android.app.KeyguardManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.Process;
import android.os.VibrationEffect;
import android.os.Vibrator;

import java.util.List;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class FocusService extends Service {
    public static final String ACTION_START = "com.nafiz.focusphone.START";
    public static final String ACTION_STOP = "com.nafiz.focusphone.STOP";

    private static final String CHANNEL_RUNNING = "focus_running";
    private static final String CHANNEL_ALERT = "focus_alert";
    private static final int NOTIFICATION_RUNNING = 1001;
    private static final int NOTIFICATION_ALERT = 1002;

    private ScheduledExecutorService executor;
    private volatile boolean active = false;
    private long sessionStartMs = 0L;
    private long currentDistractionMs = 0L;
    private long totalPhoneMs = 0L;
    private int alertCount = 0;
    private long nextAlertAtMs = 0L;
    private String currentPackage = "";
    private int tickCounter = 0;

    @Override
    public void onCreate() {
        super.onCreate();
        createChannels();
        executor = Executors.newSingleThreadScheduledExecutor();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent == null ? ACTION_START : intent.getAction();
        if (ACTION_STOP.equals(action)) {
            stopSession();
            return START_NOT_STICKY;
        }

        if (!active) startSession();
        return START_STICKY;
    }

    private synchronized void startSession() {
        if (active) return;

        active = true;
        sessionStartMs = System.currentTimeMillis();
        currentDistractionMs = 0L;
        totalPhoneMs = 0L;
        alertCount = 0;
        nextAlertAtMs = 0L;
        currentPackage = "";

        persistState();
        startForeground(NOTIFICATION_RUNNING, buildRunningNotification());

        executor.scheduleAtFixedRate(() -> {
            try { tick(); } catch (Throwable ignored) {}
        }, 0, 1, TimeUnit.SECONDS);
    }

    private void tick() {
        if (!active) return;

        long now = System.currentTimeMillis();
        currentPackage = getForegroundPackage(now);

        boolean distracting = isPhoneActivelyBeingUsed(currentPackage);
        long limitMs = Prefs.limitMs(this);
        long repeatMs = Math.max(5_000L, Prefs.repeatMs(this));

        if (distracting) {
            currentDistractionMs += 1_000L;
            totalPhoneMs += 1_000L;

            if (currentDistractionMs >= limitMs &&
                    (nextAlertAtMs == 0L || currentDistractionMs >= nextAlertAtMs)) {
                alertCount++;
                nextAlertAtMs = currentDistractionMs + repeatMs;
                playAlert();
            }
        } else {
            currentDistractionMs = 0L;
            nextAlertAtMs = 0L;
        }

        persistState();

        tickCounter++;
        if (tickCounter % 5 == 0) {
            NotificationManager nm =
                    (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) nm.notify(NOTIFICATION_RUNNING, buildRunningNotification());
        }
    }

    private boolean isPhoneActivelyBeingUsed(String pkg) {
        if (pkg == null || pkg.isEmpty()) return false;

        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (pm != null && !pm.isInteractive()) return false;

        KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
        if (km != null && km.isKeyguardLocked()) return false;

        if (getPackageName().equals(pkg)) return false;

        Set<String> allowed = Prefs.allowedPackages(this);
        return !allowed.contains(pkg);
    }

    private String getForegroundPackage(long now) {
        UsageStatsManager usm =
                (UsageStatsManager) getSystemService(Context.USAGE_STATS_SERVICE);
        if (usm == null) return "";

        String lastPkg = "";
        long lastEventTime = 0L;

        UsageEvents events = usm.queryEvents(now - 15_000L, now);
        if (events != null) {
            UsageEvents.Event event = new UsageEvents.Event();
            while (events.hasNextEvent()) {
                events.getNextEvent(event);
                int type = event.getEventType();
                if ((type == UsageEvents.Event.MOVE_TO_FOREGROUND ||
                        (Build.VERSION.SDK_INT >= 29 &&
                                type == UsageEvents.Event.ACTIVITY_RESUMED)) &&
                        event.getTimeStamp() >= lastEventTime) {
                    lastEventTime = event.getTimeStamp();
                    lastPkg = event.getPackageName();
                }
            }
        }

        if (!lastPkg.isEmpty()) return lastPkg;

        List<UsageStats> stats = usm.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY, now - 60_000L, now);
        long latest = 0L;
        if (stats != null) {
            for (UsageStats s : stats) {
                if (s.getLastTimeUsed() > latest) {
                    latest = s.getLastTimeUsed();
                    lastPkg = s.getPackageName();
                }
            }
        }
        return lastPkg == null ? "" : lastPkg;
    }

    private void playAlert() {
        AudioStore.playRandom(this);
        vibrate();

        NotificationManager nm =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(NOTIFICATION_ALERT, buildAlertNotification());
    }

    private void vibrate() {
        Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (v == null || !v.hasVibrator()) return;
        try {
            if (Build.VERSION.SDK_INT >= 26) {
                v.vibrate(VibrationEffect.createWaveform(
                        new long[]{0, 180, 110, 260}, -1));
            } else {
                v.vibrate(new long[]{0, 180, 110, 260}, -1);
            }
        } catch (Exception ignored) {}
    }

    private Notification buildRunningNotification() {
        Intent open = new Intent(this, MainActivity.class);
        PendingIntent content = PendingIntent.getActivity(
                this, 10, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Intent stop = new Intent(this, FocusService.class).setAction(ACTION_STOP);
        PendingIntent stopPi = PendingIntent.getService(
                this, 11, stop,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        String text = "Phone " + formatDuration(currentDistractionMs)
                + " / " + formatDuration(Prefs.limitMs(this));

        return new Notification.Builder(this, CHANNEL_RUNNING)
                .setSmallIcon(com.nafiz.focusphone.R.drawable.ic_focus)
                .setContentTitle("Focus Mode is running")
                .setContentText(text)
                .setContentIntent(content)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .addAction(new Notification.Action.Builder(
                        null, "Stop Focus", stopPi).build())
                .build();
    }

    private Notification buildAlertNotification() {
        Intent open = new Intent(this, MainActivity.class);
        PendingIntent content = PendingIntent.getActivity(
                this, 12, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        return new Notification.Builder(this, CHANNEL_ALERT)
                .setSmallIcon(com.nafiz.focusphone.R.drawable.ic_focus)
                .setContentTitle("Put the phone down")
                .setContentText("You've been distracted for "
                        + formatDuration(currentDistractionMs) + ".")
                .setContentIntent(content)
                .setAutoCancel(true)
                .setTimeoutAfter(15_000L)
                .build();
    }

    private void createChannels() {
        if (Build.VERSION.SDK_INT < 26) return;

        NotificationManager nm =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        NotificationChannel running = new NotificationChannel(
                CHANNEL_RUNNING,
                "Focus session",
                NotificationManager.IMPORTANCE_LOW);
        running.setDescription("Keeps Focus Mode reliable in the background.");
        running.setSound(null, null);

        NotificationChannel alert = new NotificationChannel(
                CHANNEL_ALERT,
                "Distraction alerts",
                NotificationManager.IMPORTANCE_HIGH);
        alert.setDescription("Visual alerts when phone-use time crosses your limit.");
        alert.setSound(null, null);
        alert.enableVibration(false);

        nm.createNotificationChannel(running);
        nm.createNotificationChannel(alert);
    }

    private void persistState() {
        long now = System.currentTimeMillis();
        Prefs.state(this).edit()
                .putBoolean("focus_active", active)
                .putLong("session_start_ms", sessionStartMs)
                .putLong("current_distraction_ms", currentDistractionMs)
                .putLong("session_phone_ms", totalPhoneMs)
                .putInt("session_alerts", alertCount)
                .putString("current_package", currentPackage == null ? "" : currentPackage)
                .putLong("updated_at", now)
                .apply();
    }

    private synchronized void stopSession() {
        if (!active) {
            stopForeground(true);
            stopSelf();
            return;
        }

        long focusMs = Math.max(0L, System.currentTimeMillis() - sessionStartMs);
        Prefs.addToToday(this, focusMs, totalPhoneMs, alertCount);

        active = false;
        currentDistractionMs = 0L;
        nextAlertAtMs = 0L;
        currentPackage = "";
        persistState();
        AudioStore.stop();

        try {
            if (executor != null) executor.shutdownNow();
        } catch (Exception ignored) {}

        stopForeground(true);
        stopSelf();
    }

    public static boolean hasUsageAccess(Context c) {
        AppOpsManager appOps =
                (AppOpsManager) c.getSystemService(Context.APP_OPS_SERVICE);
        if (appOps == null) return false;
        int mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                c.getPackageName());
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    public static String formatDuration(long ms) {
        long sec = Math.max(0L, ms / 1000L);
        long min = sec / 60L;
        long rem = sec % 60L;
        return String.format(java.util.Locale.US, "%02d:%02d", min, rem);
    }

    @Override
    public void onDestroy() {
        AudioStore.stop();
        try {
            if (executor != null) executor.shutdownNow();
        } catch (Exception ignored) {}
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
