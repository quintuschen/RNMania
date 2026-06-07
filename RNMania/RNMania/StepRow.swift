import SwiftUI

enum StepStatus {
    case done, inProgress, pending
}

struct StepRow: View {
    let step: Int
    let title: String
    let status: StepStatus

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(color)
                    .frame(width: 28, height: 28)
                Text("\(step)")
                    .font(.caption.bold())
                    .foregroundStyle(.white)
            }
            Text(title)
                .font(.body)
            Spacer()
            Image(systemName: icon)
                .foregroundStyle(color)
        }
    }

    private var color: Color {
        switch status {
        case .done: .green
        case .inProgress: .orange
        case .pending: .secondary
        }
    }

    private var icon: String {
        switch status {
        case .done: "checkmark.circle.fill"
        case .inProgress: "clock.fill"
        case .pending: "circle"
        }
    }
}
