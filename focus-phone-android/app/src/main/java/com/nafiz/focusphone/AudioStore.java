package com.nafiz.focusphone;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.ToneGenerator;
import android.net.Uri;
import android.provider.OpenableColumns;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Random;

public final class AudioStore {
    private static MediaPlayer activePlayer;
    private static String lastPlayed = "";
    private static final Random RNG = new Random();

    private AudioStore() {}

    public static File memeDir(Context c) {
        File dir = new File(c.getFilesDir(), "memes");
        if (!dir.exists()) dir.mkdirs();
        return dir;
    }

    public static List<File> list(Context c) {
        File[] files = memeDir(c).listFiles();
        List<File> result = new ArrayList<>();
        if (files != null) {
            Collections.addAll(result, files);
            result.removeIf(f -> !f.isFile());
        }
        return result;
    }

    public static int count(Context c) {
        return list(c).size();
    }

    public static int importUris(Context c, List<Uri> uris) {
        int copied = 0;
        ContentResolver cr = c.getContentResolver();
        for (Uri uri : uris) {
            try {
                String display = displayName(cr, uri);
                String ext = extension(display);
                File out = new File(memeDir(c),
                        String.format(Locale.US, "meme_%d_%d%s",
                                System.currentTimeMillis(), copied, ext));
                try (InputStream in = cr.openInputStream(uri);
                     FileOutputStream fos = new FileOutputStream(out)) {
                    if (in == null) continue;
                    byte[] buf = new byte[32 * 1024];
                    int n;
                    while ((n = in.read(buf)) > 0) fos.write(buf, 0, n);
                }
                if (out.length() > 0) copied++;
                else out.delete();
            } catch (Exception ignored) {
            }
        }
        return copied;
    }

    private static String displayName(ContentResolver cr, Uri uri) {
        try (Cursor cursor = cr.query(uri, new String[]{OpenableColumns.DISPLAY_NAME},
                null, null, null)) {
            if (cursor != null && cursor.moveToFirst()) {
                int i = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (i >= 0) return cursor.getString(i);
            }
        } catch (Exception ignored) {}
        return "sound.mp3";
    }

    private static String extension(String name) {
        int i = name == null ? -1 : name.lastIndexOf('.');
        if (i >= 0 && i < name.length() - 1 && name.length() - i <= 6) {
            return name.substring(i).toLowerCase(Locale.US);
        }
        return ".audio";
    }

    public static boolean playRandom(Context c) {
        List<File> files = list(c);
        if (files.isEmpty()) {
            fallbackTone();
            return false;
        }

        List<File> pool = new ArrayList<>();
        for (File f : files) {
            if (!f.getAbsolutePath().equals(lastPlayed)) pool.add(f);
        }
        if (pool.isEmpty()) pool = files;

        File chosen = pool.get(RNG.nextInt(pool.size()));
        lastPlayed = chosen.getAbsolutePath();

        stop();
        try {
            MediaPlayer mp = new MediaPlayer();
            AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build();
            mp.setAudioAttributes(attrs);
            mp.setDataSource(chosen.getAbsolutePath());
            mp.setOnCompletionListener(player -> {
                try { player.release(); } catch (Exception ignored) {}
                if (activePlayer == player) activePlayer = null;
            });
            mp.setOnErrorListener((player, what, extra) -> {
                try { player.release(); } catch (Exception ignored) {}
                if (activePlayer == player) activePlayer = null;
                fallbackTone();
                return true;
            });
            mp.prepare();
            activePlayer = mp;
            mp.start();
            return true;
        } catch (Exception e) {
            fallbackTone();
            return false;
        }
    }

    public static void stop() {
        MediaPlayer p = activePlayer;
        activePlayer = null;
        if (p != null) {
            try { p.stop(); } catch (Exception ignored) {}
            try { p.release(); } catch (Exception ignored) {}
        }
    }

    public static boolean mediaVolumeIsZero(Context c) {
        AudioManager am = (AudioManager) c.getSystemService(Context.AUDIO_SERVICE);
        return am == null || am.getStreamVolume(AudioManager.STREAM_MUSIC) == 0;
    }

    private static void fallbackTone() {
        try {
            ToneGenerator tone = new ToneGenerator(AudioManager.STREAM_MUSIC, 100);
            tone.startTone(ToneGenerator.TONE_CDMA_ALERT_CALL_GUARD, 900);
            new android.os.Handler(android.os.Looper.getMainLooper())
                    .postDelayed(tone::release, 1200);
        } catch (Exception ignored) {}
    }
}
