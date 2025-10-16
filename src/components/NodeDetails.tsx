'use client';

import { useState } from 'react';
import { LABEL_COLORS, UiNode } from '@/lib/types';
import { Manual } from './Manual';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type NodeDetailsProps = { selectedNode?: UiNode };

// Utility function to add line breaks after every 3-4 sentences
const formatTextWithBreaks = (text: string): string => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const formattedParagraphs: string[] = [];

  for (let i = 0; i < sentences.length; i += 3) {
    const paragraph = sentences.slice(i, i + 3).join(' ');
    formattedParagraphs.push(paragraph);
  }

  return formattedParagraphs.join('\n\n');
};

const NodeDetails = ({ selectedNode }: NodeDetailsProps) => {
  const [showModal, setShowModal] = useState(false);

  if (!selectedNode) return <Manual />;

  const infactAnalysis = selectedNode.data?.infact_analysis as any;
  const infactStatus = selectedNode.data?.infact_status as string;
  const infactHtmlContent = selectedNode.data?.infact_analysis_html_content as string;

  return (
    <div className="p-4 flex flex-col h-full">
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg shadow-lg w-3/4 h-3/4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Infact Analysis Details</h3>
              <Button onClick={() => setShowModal(false)}>Close</Button>
            </div>
            <iframe
              srcDoc={infactHtmlContent}
              className="w-full h-full border-0"
              title="Infact Analysis Report"
            />
          </div>
        </div>
      )}

      <Card className="flex flex-col h-full">
        <CardHeader className="flex flex-row items-end justify-between space-y-0 pb-4 gap-4 border-b-2 mb-4">
          <CardTitle className="text-lg font-bold">
            {selectedNode.data.label}
          </CardTitle>
          <Badge
            variant="secondary"
            className={`bg-${LABEL_COLORS[selectedNode.data.nodeLabel]}`}
          >
            {selectedNode.data.nodeLabel}
          </Badge>
        </CardHeader>

        <CardContent className="overflow-auto flex-grow space-y-4">
          {typeof selectedNode.data.trl_current === 'string' && (
            <div className="space-y-2 pb-2 border-b-2">
              <h4 className="font-semibold text-sm text-gray-700">
                TRL Current
              </h4>
              <p className="text-sm">{selectedNode.data.trl_current}</p>
            </div>
          )}

          {infactAnalysis && (
            <div className="space-y-2 pb-2 border-b-2">
              <h4 className="font-semibold text-sm text-gray-700">
                TRL InFact Analysis
              </h4>
              <div className="space-y-1 text-sm">
                <p><strong>TRL Probability:</strong> {infactAnalysis.probability}</p>
                <p><strong>Uncertainty:</strong> {infactAnalysis.uncertainty}</p>
                <p><strong>Interpretation:</strong> {infactAnalysis.interpretation}</p>
                <p><strong>InFact Analysis Status:</strong> {infactStatus}</p>
              </div>
              {infactHtmlContent && (
                <Button
                  onClick={() => setShowModal(true)}
                  size="sm"
                  className="mt-2"
                  variant="outline"
                >
                  View InFact Analysis Report
                </Button>
              )}
            </div>
          )}

          {typeof selectedNode.data.subtype === 'string' && (
            <div className="space-y-2 pb-2 border-b-2">
              <h4 className="font-semibold text-sm text-gray-700">Subtype</h4>
              <p className="text-sm">{selectedNode.data.subtype}</p>
            </div>
          )}

          {typeof selectedNode.data.trl_projected_5_10_years === 'string' && (
            <div className="space-y-2 pb-2 border-b-2">
              <h4 className="font-semibold text-sm text-gray-700">
                TRL Projected (5-10 years)
              </h4>
              <p className="text-sm">
                {selectedNode.data.trl_projected_5_10_years}
              </p>
            </div>
          )}

          {typeof selectedNode.data.detailedDescription === 'string' && (
            <div className="space-y-2">
              <Accordion type="single" collapsible>
                <AccordionItem value="description">
                  <AccordionTrigger className="text-sm font-semibold text-gray-700">
                    Description
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-600 whitespace-pre-line">
                      {formatTextWithBreaks(
                        selectedNode.data.detailedDescription,
                      )}
                    </p>
                  </AccordionContent>
                </AccordionItem>
                {Array.isArray(selectedNode.data.references) && (
                  <AccordionItem value="references">
                    <AccordionTrigger className="text-sm font-semibold text-gray-700">
                      References
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {selectedNode.data.references.map(
                          (ref: string, idx: number) => {
                            const text = ref;
                            const isLink = /^(https?:\/\/|doi:|arxiv:)/i.test(
                              text,
                            );
                            return (
                              <li key={idx} className="break-words">
                                {isLink ? (
                                  <a
                                    href={
                                      text.startsWith('http')
                                        ? text
                                        : undefined
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {text}
                                  </a>
                                ) : (
                                  <span>{text}</span>
                                )}
                              </li>
                            );
                          },
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NodeDetails;