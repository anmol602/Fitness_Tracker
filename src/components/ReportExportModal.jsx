import { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CalendarDays,
  Dumbbell,
  Apple,
  TrendingUp
} from "lucide-react";
import Modal from "./Modal";
import { addNotification } from "../utils/notifications";
import { getCurrentUser } from "../utils/userStorage";
import { mergePreferences } from "../utils/preferences";
import { formatDate, localDateString } from "../utils/format";

const escapeCsvCell = (value) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]
  );

export default function ReportExportModal({
  open,
  onClose,
  workouts = [],
  nutrition = [],
  progress = [],
  preferences
}) {
  const [error, setError] = useState("");
  const prefs = mergePreferences(preferences);
  const user = getCurrentUser();

  const unitLabel = prefs.units === "imperial" ? "lb" : "kg";

  const weightValue = (weight) => {
    const numeric = Number(weight) || 0;
    return prefs.units === "imperial"
      ? Math.round(numeric * 2.20462 * 10) / 10
      : Math.round(numeric * 10) / 10;
  };

  const exportCsv = () => {
    setError("");

    const rows = [
      ["FitNova Fitness Report"],
      ["Generated", new Date().toLocaleString()],
      ["User", user.name || "FitNova member"],
      ["Units", unitLabel],
      [],
      ["WORKOUTS"],
      ["Date", "Title", "Category", "Duration (min)", "Calories (kcal)"],
      ...workouts.map((workout) => [
        formatDate(workout.date || workout.createdAt),
        workout.title,
        workout.category || "General",
        workout.duration || 0,
        workout.calories || 0
      ]),
      [],
      ["NUTRITION"],
      [
        "Date",
        "Food",
        "Category",
        "Calories (kcal)",
        "Protein (g)",
        "Carbs (g)",
        "Fats (g)"
      ],
      ...nutrition.map((meal) => [
        formatDate(meal.date || meal.createdAt),
        meal.foodName,
        meal.category || "Other",
        meal.calories || 0,
        meal.protein || 0,
        meal.carbs || 0,
        meal.fats || 0
      ]),
      [],
      ["PROGRESS"],
      ["Date", `Weight (${unitLabel})`, "Height (cm)", "Goal"],
      ...progress.map((entry) => [
        formatDate(entry.date || entry.createdAt),
        weightValue(entry.weight),
        entry.height || 0,
        entry.goal || "General Fitness"
      ])
    ];

    const csv = rows
      .map((row) => row.map(escapeCsvCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `fitnova-report-${localDateString()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    addNotification({
      type: "system",
      title: "Report exported",
      message: "Your CSV fitness report was downloaded successfully."
    });
  };

  const tableHtml = (title, headers, rows) => `
    <section>
      <h2>${escapeHtml(title)}</h2>
      ${
        rows.length
          ? `<table>
              <thead>
                <tr>${headers
                  .map((header) => `<th>${escapeHtml(header)}</th>`)
                  .join("")}</tr>
              </thead>
              <tbody>
                ${rows
                  .map(
                    (row) =>
                      `<tr>${row
                        .map((cell) => `<td>${escapeHtml(cell)}</td>`)
                        .join("")}</tr>`
                  )
                  .join("")}
              </tbody>
            </table>`
          : "<p class=\"empty\">No records yet.</p>"
      }
    </section>
  `;

  const exportPdf = () => {
    setError("");

    const printWindow = window.open("", "_blank", "width=980,height=720");

    if (!printWindow) {
      setError("Please allow pop-ups for this site to export the PDF report.");
      return;
    }

    const workoutRows = workouts.map((workout) => [
      formatDate(workout.date || workout.createdAt),
      workout.title,
      workout.category || "General",
      workout.duration || 0,
      workout.calories || 0
    ]);

    const nutritionRows = nutrition.map((meal) => [
      formatDate(meal.date || meal.createdAt),
      meal.foodName,
      meal.category || "Other",
      meal.calories || 0,
      meal.protein || 0,
      meal.carbs || 0,
      meal.fats || 0
    ]);

    const progressRows = progress.map((entry) => [
      formatDate(entry.date || entry.createdAt),
      `${weightValue(entry.weight)} ${unitLabel}`,
      entry.height || "—",
      entry.goal || "General Fitness"
    ]);

    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>FitNova Report - ${localDateString()}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 32px;
              font-family: Inter, Arial, sans-serif;
              color: #17210f;
              background: #ffffff;
            }
            header {
              border-bottom: 3px solid #b7ff4a;
              padding-bottom: 18px;
              margin-bottom: 24px;
            }
            h1 { margin: 0 0 6px; font-size: 26px; }
            h2 {
              margin: 28px 0 10px;
              font-size: 16px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #4d7c0f;
            }
            .meta { color: #5b6653; font-size: 12px; line-height: 1.7; }
            .summary { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
            .summary span {
              border: 1px solid #d6e3cb;
              background: #f5faef;
              border-radius: 999px;
              padding: 7px 12px;
              font-size: 12px;
              font-weight: 600;
            }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #dfe8d7; padding: 8px 10px; text-align: left; }
            th { background: #eef6e5; font-weight: 700; }
            tr:nth-child(even) td { background: #fafcf7; }
            .empty { font-size: 12px; color: #6b7280; }
            footer { margin-top: 32px; font-size: 11px; color: #6b7280; text-align: center; }
            @media print { body { padding: 12px; } }
          </style>
        </head>
        <body>
          <header>
            <h1>FitNova Fitness Report</h1>
            <div class="meta">
              <strong>${escapeHtml(user.name || "FitNova member")}</strong><br />
              Generated on ${escapeHtml(new Date().toLocaleString())}<br />
              Units: ${escapeHtml(unitLabel)} · Workouts: ${workouts.length} · Meals: ${nutrition.length} · Progress logs: ${progress.length}
            </div>
            <div class="summary">
              <span>${workouts.length} workouts</span>
              <span>${nutrition.length} nutrition entries</span>
              <span>${progress.length} progress logs</span>
            </div>
          </header>

          ${tableHtml(
            "Workouts",
            ["Date", "Title", "Category", "Duration (min)", "Calories (kcal)"],
            workoutRows
          )}

          ${tableHtml(
            "Nutrition",
            [
              "Date",
              "Food",
              "Category",
              "Calories (kcal)",
              "Protein (g)",
              "Carbs (g)",
              "Fats (g)"
            ],
            nutritionRows
          )}

          ${tableHtml(
            "Progress",
            ["Date", `Weight (${unitLabel})`, "Height (cm)", "Goal"],
            progressRows
          )}

          <footer>Generated by FitNova · Be Fit. Be Happy.</footer>
        </body>
      </html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => printWindow.print(), 400);

    addNotification({
      type: "system",
      title: "PDF report ready",
      message: "The print dialog is open. Choose “Save as PDF” to download."
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reports & Export"
      description="Download your fitness progress and nutrition data."
      icon={FileText}
    >
      <div className="flex flex-wrap gap-2">
        {[
          { icon: Dumbbell, label: `${workouts.length} workouts` },
          { icon: Apple, label: `${nutrition.length} meals` },
          { icon: TrendingUp, label: `${progress.length} progress logs` }
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 bg-[#0D120D] border border-[#26391C] rounded-full px-3 py-1.5"
          >
            <Icon className="text-[#B7FF4A]" size={14} />
            {label}
          </span>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-5">
        <button
          type="button"
          onClick={exportCsv}
          className="group text-left rounded-2xl border border-[#26391C] bg-[#0D120D] p-4 hover:border-[#B7FF4A]/60 transition"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-400/10">
              <FileSpreadsheet className="text-emerald-300" size={21} />
            </div>
            <Download
              className="text-gray-600 group-hover:text-[#B7FF4A] transition"
              size={18}
            />
          </div>

          <p className="font-semibold mt-3">Export CSV</p>
          <p className="text-xs text-gray-500 mt-1">
            Spreadsheet-ready data for workouts, meals and progress.
          </p>
        </button>

        <button
          type="button"
          onClick={exportPdf}
          className="group text-left rounded-2xl border border-[#26391C] bg-[#0D120D] p-4 hover:border-[#B7FF4A]/60 transition"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-red-400/10">
              <FileText className="text-red-300" size={21} />
            </div>
            <Download
              className="text-gray-600 group-hover:text-[#B7FF4A] transition"
              size={18}
            />
          </div>

          <p className="font-semibold mt-3">Export PDF</p>
          <p className="text-xs text-gray-500 mt-1">
            Opens a styled report. Choose “Save as PDF” in the print dialog.
          </p>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2.5">
          <AlertTriangle className="text-red-300 shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-red-200">{error}</p>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-[#26391C] bg-[#0D120D] p-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <CalendarDays className="text-[#B7FF4A]" size={16} />
          Your report includes
        </h3>

        <ul className="mt-3 space-y-2 text-xs text-gray-400">
          <li>• Workout history with duration and calories burned</li>
          <li>• Nutrition entries with macros and calorie totals</li>
          <li>• Weight and goal progress ({unitLabel} units)</li>
        </ul>
      </div>

      <p className="text-[11px] text-gray-500 mt-4">
        Reports use the data currently loaded on this dashboard. Export again
        after adding new activity to keep them up to date.
      </p>
    </Modal>
  );
}
