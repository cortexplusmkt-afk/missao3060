package com.cortexplus.missao3060;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import java.text.NumberFormat;
import java.util.Locale;

public class MissaoWidgetProvider extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) update(context, manager, id);
    }

    public static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, MissaoWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(component);
        for (int id : ids) update(context, manager, id);
    }

    private static void update(Context context, AppWidgetManager manager, int id) {
        SharedPreferences p = context.getSharedPreferences("missao_widget", Context.MODE_PRIVATE);
        RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_missao);
        int day = p.getInt("day", 1), streak = p.getInt("streak", 1), progress = p.getInt("progress", 0);
        int water = p.getInt("water", 0), steps = p.getInt("steps", 0), cortex = p.getInt("cortex", 0);
        String weight = p.getString("weight", "--");
        String mission = p.getString("mission", "Missão em andamento");

        v.setTextViewText(R.id.w_day, "DIA " + day + " / 60");
        v.setTextViewText(R.id.w_streak, "🔥 " + streak + "D");
        v.setTextViewText(R.id.w_progress, progress + "%");
        v.setProgressBar(R.id.w_bar, 100, progress, false);
        v.setTextViewText(R.id.w_weight, weight);
        v.setTextViewText(R.id.w_water, "💧 " + water + "/4");
        v.setTextViewText(R.id.w_steps, "👟 " + NumberFormat.getIntegerInstance(new Locale("pt", "BR")).format(steps));
        v.setTextViewText(R.id.w_cortex, "⚡ " + cortex + "/60");
        v.setTextViewText(R.id.w_mission, mission.toUpperCase());

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pending = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        v.setOnClickPendingIntent(R.id.widget_root, pending);
        manager.updateAppWidget(id, v);
    }
}
