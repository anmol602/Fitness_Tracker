import { useState } from "react";
import {
  LifeBuoy,
  Mail,
  MessageSquare,
  Bug,
  Lightbulb,
  CheckCircle2,
  Send,
  Clock3
} from "lucide-react";
import Modal from "./Modal";
import api from "../api";
import { addNotification } from "../utils/notifications";
import { getCurrentUser, getUserKey } from "../utils/userStorage";

const displayTicketId = (id) => {
  const value = String(id || "");

  return value.startsWith("FN-")
    ? value
    : `FN-${value.slice(-6).toUpperCase()}`;
};

const CATEGORIES = [
  { value: "feedback", label: "Feedback", icon: MessageSquare },
  { value: "bug", label: "Bug report", icon: Bug },
  { value: "feature", label: "Feature request", icon: Lightbulb }
];

export default function SupportModal({ open, onClose }) {
  const [category, setCategory] = useState("feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const user = getCurrentUser();
  const canSubmit = subject.trim() && message.trim();

  const submitTicket = async (event) => {
    event.preventDefault();

    if (!canSubmit || submitting) return;

    setError("");
    setSubmitting(true);

    const payload = {
      category,
      subject: subject.trim(),
      message: message.trim(),
      email: user.email || ""
    };

    let ticket;

    try {
      const response = await api.post("/feedback", payload);
      const saved = response.data.ticket;

      ticket = {
        id: saved.id,
        category: saved.category,
        subject: saved.subject,
        status: saved.status,
        createdAt: saved.createdAt
      };
    } catch {
      // Backend unavailable ho to ticket browser me save kar lo
      const id = `FN-${Date.now().toString().slice(-6)}`;

      ticket = {
        id,
        ...payload,
        status: "Open",
        createdAt: new Date().toISOString()
      };

      try {
        const storageKey = getUserKey("fitnova_support_tickets");
        const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");

        localStorage.setItem(
          storageKey,
          JSON.stringify([ticket, ...(Array.isArray(existing) ? existing : [])])
        );
      } catch {
        // ignore local storage errors
      }
    }

    const ticketLabel = displayTicketId(ticket.id);

    addNotification({
      type: "system",
      title: "Support request sent",
      message: `Ticket ${ticketLabel} created. We'll reply at ${user.email || "your email"}.`
    });

    setSubmitted(ticket);
    setSubject("");
    setMessage("");
    setCategory("feedback");
    setSubmitting(false);
  };

  const sendAnother = () => {
    setSubmitted(null);
    setError("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Feedback & Support"
      description="Report an issue, request a feature, or share feedback."
      icon={LifeBuoy}
    >
      {submitted ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#B7FF4A]/10 grid place-items-center">
            <CheckCircle2 className="text-[#B7FF4A]" size={32} />
          </div>

          <h3 className="text-lg font-bold mt-4">Message sent!</h3>
          <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
            Thanks for reaching out. Your support ticket{" "}
            <span className="text-[#B7FF4A] font-semibold">
              {displayTicketId(submitted.id)}
            </span>{" "}
            has been created.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 text-xs text-gray-400 bg-[#0D120D] border border-[#26391C] rounded-lg px-3 py-2">
            <Clock3 className="text-[#B7FF4A]" size={14} />
            Expected response: within 24 hours
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <button
              type="button"
              onClick={sendAnother}
              className="flex-1 border border-[#26391C] text-gray-300 font-semibold px-4 py-2.5 rounded-xl hover:border-[#B7FF4A]/50 hover:text-[#B7FF4A] transition"
            >
              Send another message
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#B7FF4A] text-black font-bold px-4 py-2.5 rounded-xl hover:bg-[#C8FF78] transition"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href="mailto:support@fitnova.app"
              className="flex items-center gap-3 rounded-xl border border-[#26391C] bg-[#0D120D] p-3 hover:border-[#B7FF4A]/50 transition"
            >
              <div className="p-2 rounded-lg bg-[#B7FF4A]/10">
                <Mail className="text-[#B7FF4A]" size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold">Email support</p>
                <p className="text-[11px] text-gray-500 truncate">
                  support@fitnova.app
                </p>
              </div>
            </a>

            <div className="flex items-center gap-3 rounded-xl border border-[#26391C] bg-[#0D120D] p-3">
              <div className="p-2 rounded-lg bg-[#B7FF4A]/10">
                <Clock3 className="text-[#B7FF4A]" size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold">Response time</p>
                <p className="text-[11px] text-gray-500">Within 24 hours</p>
              </div>
            </div>
          </div>

          <form onSubmit={submitTicket} className="mt-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1.5">
                What can we help with?
              </p>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCategory(item.value)}
                      aria-pressed={category === item.value}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        category === item.value
                          ? "bg-[#B7FF4A] text-black"
                          : "text-gray-400 bg-[#0D120D] border border-[#26391C] hover:text-[#B7FF4A] hover:border-[#B7FF4A]/50"
                      }`}
                    >
                      <Icon size={14} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="support-subject"
                className="block text-xs font-semibold text-gray-400 mb-1.5"
              >
                Subject
              </label>

              <input
                id="support-subject"
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Short summary of your message"
                className="w-full bg-[#0D120D] border border-[#26391C] rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-[#B7FF4A]/60"
              />
            </div>

            <div>
              <label
                htmlFor="support-message"
                className="block text-xs font-semibold text-gray-400 mb-1.5"
              >
                Message
              </label>

              <textarea
                id="support-message"
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Tell us what happened or what you would like to see..."
                className="w-full resize-none bg-[#0D120D] border border-[#26391C] rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-[#B7FF4A]/60"
              />
            </div>

            <p className="text-[11px] text-gray-500">
              We will reply to{" "}
              <span className="text-gray-300">{user.email || "your account email"}</span>.
            </p>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#B7FF4A] text-black font-bold px-4 py-3 rounded-xl hover:bg-[#C8FF78] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send size={17} />
              {submitting ? "Sending..." : "Send message"}
            </button>
          </form>
        </>
      )}
    </Modal>
  );
}
