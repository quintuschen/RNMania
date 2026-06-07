//
//  ContentView.swift
//  RNMania
//
//  Created by Guo Chen on 07/06/2026.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }

            RNPlaceholderView()
                .tabItem {
                    Label("Web Module", systemImage: "globe")
                }
        }
    }
}

#Preview {
    ContentView()
}
