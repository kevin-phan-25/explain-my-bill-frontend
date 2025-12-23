import React, { useState } from "react";
import jsPDF from "jspdf";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Assuming shadcn/ui or similar
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ExplanationCard({ result, onUpgrade, onUseSample }) {
  if (!result) return null;

  const { explanation, pages = [], isPaid } = result;
  const [openItems, setOpenItems] = useState(["summary"]);

  // Try to parse structured data from fullExplanation or per-page
  const structured = pages.length > 0
    ? pages.map(p => {
        try { return JSON.parse(p.explanation); } catch { return null; }
      }).filter(Boolean)
    : [];

  const hasStructured = structured.length > 0;
  const mainData = hasStructured ? structured[0] : null; // Use first page for summary

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(explanation || "Medical Bill Explanation", 15, 15);
    doc.save("Medical_Bill_Explanation.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
            🔍 Your Medical Bill Review
          </h1>
          <p className="text-xl text-white/80">AI-powered insights • Clear • Actionable</p>
        </div>

        {/* Key Metrics Grid - Futuristic Glass Cards */}
        {mainData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total Charges", value: mainData.keyAmounts.totalCharges || "N/A", color: "from-red-500 to-orange-500" },
              { label: "Insurance Paid", value: mainData.keyAmounts.insurancePaid || "N/A", color: "from-green-500 to-emerald-500" },
              { label: "You Owe", value: mainData.keyAmounts.patientResponsibility || "N/A", color: "from-yellow-500 to-amber-500" },
              { label: "Potential Savings", value: isPaid ? "Up to $XXX" : "???", color: "from-blue-500 to-cyan-500" },
            ].map((item, i) => (
              <Card key={i} className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl hover:shadow-cyan-500/50 transition-all duration-500 hover:scale-105">
                <div className={`bg-gradient-to-r ${item.color} p-1 rounded-t-xl`}>
                  <div className="bg-black/40 rounded-t-xl px-6 py-3">
                    <p className="text-white/70 text-sm">{item.label}</p>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <p className="text-3xl font-bold text-white glow-cyan">{item.value}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Main Content Accordion */}
        <Card className="backdrop-blur-2xl bg-white/5 border-white/10 shadow-2xl overflow-hidden">
          <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
            {/* Summary / What We Found */}
            <AccordionItem value="summary">
              <AccordionTrigger className="px-8 text-2xl text-white hover:text-cyan-300">
                ✅ What We Found
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-8 text-white/90 text-lg leading-relaxed">
                {hasStructured ? (
                  <>
                    <p className="mb-4">{mainData.summary}</p>
                    <div className="flex flex-wrap gap-2 my-4">
                      {mainData.services.map((s, i) => (
                        <Badge key={i} variant="secondary" className="bg-white/20 text-white">{s}</Badge>
                      ))}
                    </div>
                    <p>{mainData.explanation}</p>
                  </>
                ) : (
                  <p>{explanation || "Loading explanation..."}</p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Red Flags (Paid only) */}
            {isPaid && mainData?.redFlags?.length > 0 && (
              <AccordionItem value="redflags">
                <AccordionTrigger className="px-8 text-2xl text-white hover:text-red-400">
                  ⚠️ Potential Issues Detected
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-8">
                  <ul className="space-y-3 text-white/90">
                    {mainData.redFlags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-red-400 text-2xl">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Next Steps */}
            <AccordionItem value="nextsteps">
              <AccordionTrigger className="px-8 text-2xl text-white hover:text-green-400">
                🎯 Recommended Next Steps
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-8">
                <ul className="space-y-4 text-white/90 text-lg">
                  {(hasStructured ? mainData.nextSteps : [
                    "Request an itemized bill from your provider",
                    "Compare charges at FairHealthConsumer.org",
                    "Call your insurance with questions",
                    "Appeal if something looks wrong"
                  ]).map((step, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="text-green-400 text-2xl font-bold">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Download Button */}
          <div className="p-8 text-center">
            <Button
              onClick={handleDownloadPDF}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold hover:from-cyan-400 hover:to-purple-500 shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Download Full Report as PDF
            </Button>
          </div>
        </Card>

        {/* Upgrade CTA (Free users) */}
        {!isPaid && (
          <div className="mt-16 text-center">
            <Card className="backdrop-blur-xl bg-gradient-to-r from-red-600/20 to-orange-600/20 border-red-500/30 p-10">
              <h3 className="text-4xl font-bold text-white mb-6">Unlock Expert Review & Appeal Tools</h3>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Spot hidden overcharges • Get estimated savings • Receive a ready-to-send appeal letter
              </p>
              <Button
                onClick={onUpgrade}
                size="xl"
                className="bg-white text-red-600 font-bold hover:bg-gray-100 shadow-2xl hover:scale-110 transition-transform"
              >
                Upgrade Now – Save Money Today
              </Button>
              <p className="mt-6 text-white/70">30-day money-back • One-time or unlimited plans</p>
            </Card>
          </div>
        )}
      </div>

      <style jsx>{`
        .glow-cyan {
          text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
}
