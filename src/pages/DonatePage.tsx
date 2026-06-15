import { useState } from "react";
import { Heart, Coffee } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/constants/translations";

const PRESETS = [3, 5, 10];

export function DonatePage() {
  const lang = useAppStore((s) => s.language);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(5);
  const [customAmount, setCustomAmount] = useState("20");
  const [isCustomActive, setIsCustomActive] = useState(false);

  const amount = isCustomActive
    ? Number(customAmount) || 0
    : selectedPreset ?? 0;

  const handleDonate = () => {
    if (amount <= 0) return;
    window.open(
      `https://paypal.me/rsalgado85/${amount}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-red-500/10">
            <Heart className="size-8 text-red-500 fill-red-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("donate.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {t("donate.desc", lang)}
          </p>
        </div>

        {/* Amount selection */}
        <div className="space-y-6 rounded-xl border bg-card p-6 text-left">
          <p className="text-sm font-medium">{t("donate.chooseAmount", lang)}</p>

          {/* Preset buttons + custom */}
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  setSelectedPreset(amt);
                  setIsCustomActive(false);
                }}
                className={`flex items-center justify-center rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                  selectedPreset === amt && !isCustomActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-muted"
                }`}
              >
                ${amt}
              </button>
            ))}

            {/* Editable custom amount field */}
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                $
              </span>
              <input
                type="number"
                min="1"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setIsCustomActive(true);
                }}
                onFocus={() => setIsCustomActive(true)}
                className={`w-full rounded-lg border bg-transparent py-3 pl-7 pr-1.5 text-sm font-medium outline-none transition-all text-center ${
                  isCustomActive
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                }`}
              />
            </div>
          </div>

          {/* Donate button */}
          <button
            onClick={handleDonate}
            disabled={amount <= 0}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Coffee className="size-4" />
            {t("donate.paypalButton", lang)}
            {amount > 0 ? ` — $${amount}` : ""}
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("donate.redirectNote", lang)}
        </p>
      </div>
    </div>
  );
}
