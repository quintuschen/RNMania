import SwiftUI

struct HomeView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Image(systemName: "swift")
                    .font(.system(size: 64))
                    .foregroundStyle(.orange)

                VStack(spacing: 8) {
                    Text("RN Mania")
                        .font(.largeTitle.bold())
                    Text("SwiftUI + React Native POC")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Divider()

                VStack(alignment: .leading, spacing: 12) {
                    StepRow(step: 1, title: "SwiftUI Native App", status: .done)
                    StepRow(step: 2, title: "React Web App", status: .done)
                    StepRow(step: 3, title: "React Native Module", status: .done)
                    StepRow(step: 4, title: "RN Embedded in SwiftUI", status: .inProgress)
                }
                .padding()
                .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))

                Spacer()
            }
            .padding()
            .navigationTitle("Overview")
        }
    }
}

#Preview {
    HomeView()
}
