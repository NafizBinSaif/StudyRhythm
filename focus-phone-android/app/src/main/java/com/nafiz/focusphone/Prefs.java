package com.nafiz.focusphone;

import android.content.Context;
import android.content.SharedPreferences;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

public final class Prefs {
    public static final String SETTINGS = "focus_settings";
    public static final String STATE = "focus_state";
    public static final String HISTORY = "focus_history";

    public static final String KEY_LIMIT_MS = "limit_ms";
    public static final String KEY_REPEAT_MS = "repeat_ms";
    public static final String KEY_ALLOWED = "allowed_packages";

    public static final long DEFAULT_LIMIT_MS = 120_000L;
    public static final long DEFAULT_REPEAT_MS = 20_000L;

    private Prefs() {}

    public static SharedPreferences settings(Context c) {
        return c.getSharedPreferences(SETTINGS, Context.MODE_PRIVATE);
    }

    public static SharedPreferences state(Context c) {
        return c.getSharedPreferences(STATE, Context.MODE_PRIVATE);
    }

    public static SharedPreferences history(Context c) {
        return c.getSharedPreferences(HISTORY, Context.MODE_PRIVATE);
    }

    public static long limitMs(Context c) {
        return settings(c).getLong(KEY_LIMIT_MS, DEFAULT_LIMIT_MS);
    }

    public static long repeatMs(Context c) {
        return settings(c).getLong(KEY_REPEAT_MS, DEFAULT_REPEAT_MS);
    }

    public static Set<String> allowedPackages(Context c) {
        return new HashSet<>(settings(c).getStringSet(KEY_ALLOWED, new HashSet<>()));
    }

    public static String todayKey() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    public static void addToToday(Context c, long focusMs, long phoneMs, int alerts) {
        SharedPreferences h = history(c);
        String today = todayKey();
        if (!today.equals(h.getString("date", ""))) {
            h.edit()
                    .clear()
                    .putString("date", today)
                    .putLong("focus_ms", Math.max(0, focusMs))
                    .putLong("phone_ms", Math.max(0, phoneMs))
                    .putInt("alerts", Math.max(0, alerts))
                    .apply();
            return;
        }
        h.edit()
                .putLong("focus_ms", h.getLong("focus_ms", 0L) + Math.max(0, focusMs))
                .putLong("phone_ms", h.getLong("phone_ms", 0L) + Math.max(0, phoneMs))
                .putInt("alerts", h.getInt("alerts", 0) + Math.max(0, alerts))
                .apply();
    }

    public static void ensureToday(Context c) {
        SharedPreferences h = history(c);
        String today = todayKey();
        if (!today.equals(h.getString("date", ""))) {
            h.edit().clear().putString("date", today).apply();
        }
    }
}
