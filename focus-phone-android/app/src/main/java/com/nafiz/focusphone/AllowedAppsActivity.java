package com.nafiz.focusphone;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class AllowedAppsActivity extends Activity {
    private final List<String> packages = new ArrayList<>();
    private ListView listView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(20), dp(18), dp(20), dp(18));
        root.setBackgroundColor(Color.rgb(247, 247, 245));

        TextView title = new TextView(this);
        title.setText("Allowed apps");
        title.setTextSize(28);
        title.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        title.setTextColor(Color.rgb(23, 23, 23));
        root.addView(title);

        TextView subtitle = new TextView(this);
        subtitle.setText("These apps won't count as distraction during Focus Mode.");
        subtitle.setTextSize(15);
        subtitle.setTextColor(Color.rgb(100, 100, 100));
        subtitle.setPadding(0, dp(6), 0, dp(14));
        root.addView(subtitle);

        PackageManager pm = getPackageManager();
        Intent launcher = new Intent(Intent.ACTION_MAIN, null);
        launcher.addCategory(Intent.CATEGORY_LAUNCHER);
        List<ResolveInfo> infos = pm.queryIntentActivities(launcher, 0);
        infos.sort(Comparator.comparing(
                r -> r.loadLabel(pm).toString(),
                String.CASE_INSENSITIVE_ORDER));

        List<String> labels = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (ResolveInfo info : infos) {
            String pkg = info.activityInfo.packageName;
            if (pkg.equals(getPackageName()) || !seen.add(pkg)) continue;
            labels.add(info.loadLabel(pm).toString());
            packages.add(pkg);
        }

        listView = new ListView(this);
        listView.setChoiceMode(ListView.CHOICE_MODE_MULTIPLE);
        ArrayAdapter<String> adapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_list_item_multiple_choice,
                labels);
        listView.setAdapter(adapter);

        Set<String> selected = Prefs.allowedPackages(this);
        for (int i = 0; i < packages.size(); i++) {
            if (selected.contains(packages.get(i))) {
                listView.setItemChecked(i, true);
            }
        }

        LinearLayout.LayoutParams listLp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f);
        root.addView(listView, listLp);

        Button save = new Button(this);
        save.setText("Save");
        save.setTextSize(16);
        save.setAllCaps(false);
        save.setOnClickListener(v -> {
            Set<String> set = new HashSet<>();
            for (int i = 0; i < packages.size(); i++) {
                if (listView.isItemChecked(i)) set.add(packages.get(i));
            }
            Prefs.settings(this).edit()
                    .putStringSet(Prefs.KEY_ALLOWED, set)
                    .apply();
            finish();
        });
        LinearLayout.LayoutParams saveLp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, dp(54));
        saveLp.topMargin = dp(12);
        root.addView(save, saveLp);

        setContentView(root);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
