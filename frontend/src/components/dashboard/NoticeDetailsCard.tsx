import { AnalyzeResponse } from "@/types";
import { FileSearch } from "lucide-react";

export default function NoticeDetailsCard({ data }: { data: AnalyzeResponse }) {
  const details = data.notice_details;

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 shadow-card card-hover">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center">
          <FileSearch size={14} className="text-amber-400" />
        </div>
        <h3 className="text-xs font-700 tracking-widest uppercase text-slate-500">Notice Summary</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <Info label="Sender" value={details.sender} />
        <Info label="Receiver" value={details.receiver} />
        <Info label="Subject" value={details.subject} />
        <Info label="Authority / Sender Type" value={details.authority_sender_type} />
      </div>

      <div className="mt-4 space-y-3">
        <InfoBlock label="Issue / Problem" value={details.issue_problem} />
        <InfoBlock label="Demanded Action" value={details.demanded_action} />
        <ListBlock label="Deadlines" items={details.deadlines} />
        <ListBlock label="Possible Consequences" items={details.possible_consequences} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-slate-950/40 p-3">
      <div className="text-xs font-700 tracking-widest uppercase text-slate-500 mb-1">{label}</div>
      <p className="text-sm text-slate-200 leading-relaxed">{value || "Not clearly identified"}</p>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-slate-950/40 p-4">
      <div className="text-xs font-700 tracking-widest uppercase text-slate-500 mb-2">{label}</div>
      <p className="text-sm text-slate-200 leading-relaxed">{value}</p>
    </div>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/8 bg-slate-950/40 p-4">
      <div className="text-xs font-700 tracking-widest uppercase text-slate-500 mb-2">{label}</div>
      <div className="space-y-2">
        {(items.length ? items : ["No clear information extracted."]).map((item, index) => (
          <p key={`${item}-${index}`} className="text-sm text-slate-200 leading-relaxed">{index + 1}. {item}</p>
        ))}
      </div>
    </div>
  );
}
