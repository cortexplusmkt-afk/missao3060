package com.cortexplus.missao3060;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MissaoWidgetPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
