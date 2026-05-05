import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { DiagramKey } from './DiagramKey';
import { InstructionDiagram } from './InstructionDiagram';

// ─── Mechanism data ───────────────────────────────────────────────────────────

const MECHANISM_META: Record<string, { name: string; emoji: string; description: string }> = {
  'basic-tab':    { name: 'Basic Tab Pop-Up',    emoji: '📄', description: 'A simple tab cut directly from the card creates a single standing platform.' },
  'v-fold':       { name: 'V-Fold Pop-Up',       emoji: '🔺', description: 'A folded tab glued at both card halves springs upward when the card opens.' },
  'parallel-fold':{ name: 'Parallel Fold',       emoji: '📚', description: 'Multiple tabs at increasing depths create layered 3D scenes.' },
  'box-fold':     { name: 'Box Pop-Up',          emoji: '📦', description: 'A cross-shaped template scores and folds into a 3D box.' },
  'rotating':     { name: 'Rotating Mechanism',  emoji: '🌀', description: 'Linked arms attached to both card halves rotate as the card opens.' },
  'accordion':    { name: 'Accordion Fold',      emoji: '🪗', description: 'A zigzag strip expands dramatically when the card opens.' },
};

type Step = { title: string; description: string; diagram: string };

const ASSEMBLY_STEPS: Record<string, Step[]> = {
  'basic-tab': [
    { title: 'Prepare the Card Base', description: 'Fold a piece of cardstock in half.', diagram: 'fold-base' },
    { title: 'Cut Two Parallel Slits', description: 'In the centre fold cut two parallel slits about 2 inches apart, 1–2 inches long.', diagram: 'slits' },
    { title: 'Push the Tab Forward', description: 'Push the section between the slits toward you to form a platform.', diagram: 'tab' },
    { title: 'Attach Your Design', description: 'Glue your design to the tab face. It will pop up every time the card opens.', diagram: 'glue' },
  ],
  'v-fold': [
    { title: 'Prepare the Card Base', description: 'Fold a piece of cardstock in half.', diagram: 'fold-base' },
    { title: 'Create a V-Shaped Tab', description: 'Cut a rectangle of paper and fold it in half lengthwise to form a strong V.', diagram: 'v-fold-tab' },
    { title: 'Attach to the Spine', description: 'Glue the outer edges of the V to each card half, aligning the centre crease with the card spine.', diagram: 'v-fold-attach' },
    { title: 'Mount Your Design', description: 'Glue your cut-out to the front face of the V-fold. It stands upright when the card opens.', diagram: 'v-fold-design' },
  ],
  'parallel-fold': [
    { title: 'Prepare the Card Base', description: 'Fold a piece of cardstock in half.', diagram: 'fold-base' },
    { title: 'Cut Multiple Tab Pairs', description: 'Cut 3–4 pairs of parallel slits at increasing distances from the fold.', diagram: 'parallel-slits' },
    { title: 'Angle Each Tab Differently', description: 'Push each tab forward at a slightly different angle to create depth.', diagram: 'parallel-tabs' },
    { title: 'Layer Your Elements', description: 'Glue smaller design elements to the nearest tabs and larger ones to farther tabs.', diagram: 'parallel-layers' },
  ],
  'box-fold': [
    { title: 'Prepare the Card Base', description: 'Fold a piece of cardstock in half.', diagram: 'fold-base' },
    { title: 'Create Box Template', description: 'Cut a cross-shaped piece with a square centre and four flaps.', diagram: 'box-template' },
    { title: 'Score and Fold', description: 'Score all edges and fold the flaps to form a box.', diagram: 'box-fold' },
    { title: 'Glue into the Card', description: 'Attach the bottom and back flap to the inside spine. The box pops up when the card opens.', diagram: 'box-attach' },
  ],
  'rotating': [
    { title: 'Prepare the Card Base', description: 'Fold a piece of cardstock in half.', diagram: 'fold-base' },
    { title: 'Create Rotation Arms', description: 'Cut two strips. Attach one end of each strip to opposite sides of the card spine.', diagram: 'rotate-arm' },
    { title: 'Connect the Arms', description: 'Join the free ends with a small paper circle.', diagram: 'rotate-connect' },
    { title: 'Attach Your Design', description: 'Glue your design to the connector. It will spin as the card opens.', diagram: 'rotate-design' },
  ],
  'accordion': [
    { title: 'Prepare the Card Base', description: 'Fold a piece of cardstock in half.', diagram: 'fold-base' },
    { title: 'Make an Accordion Strip', description: 'Fold a long strip of paper in a zigzag, creating 4–6 segments.', diagram: 'accordion-fold' },
    { title: 'Attach to the Card', description: 'Glue one end of the accordion to each inside card half.', diagram: 'accordion-attach' },
    { title: 'Decorate', description: 'Attach design elements to different accordion segments for an extended pop-up effect.', diagram: 'accordion-design' },
  ],
};

const DRAWING_STEPS: Step[] = [
  { title: 'Gather Materials', description: 'Paper, pencil, coloured markers, scissors, and glue stick.', diagram: 'materials' },
  { title: 'Sketch Your Design', description: 'Draw your element on a separate sheet. Aim for 3–4 inches tall.', diagram: 'draw' },
  { title: 'Add Colour & Detail', description: 'Use bright, vibrant colours for the best pop-up effect.', diagram: 'color' },
  { title: 'Cut It Out', description: 'Cut cleanly around your drawing. Keep multiple pieces separate if layering.', diagram: 'cut' },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function InstructionsView() {
  const { mechanismId = 'basic-tab' } = useParams<{ mechanismId: string }>();
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const meta     = MECHANISM_META[mechanismId] ?? MECHANISM_META['basic-tab'];
  const assembly = ASSEMBLY_STEPS[mechanismId] ?? ASSEMBLY_STEPS['basic-tab'];

  const toggleStep = (idx: number) =>
    setCompletedSteps(prev =>
      prev.includes(idx) ? prev.filter(s => s !== idx) : [...prev, idx],
    );

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <main className="max-w-7xl mx-auto px-8 py-12">
        <Button variant="ghost" onClick={() => navigate('/learn')} className="mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to techniques
        </Button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-xl text-4xl">{meta.emoji}</div>
          <div>
            <h1 className="text-3xl font-serif text-gray-900">{meta.name}</h1>
            <p className="text-gray-500 mt-1">{meta.description}</p>
          </div>
        </div>

        {/* "Try in editor" banner */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5 mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900">Ready to build?</p>
            <p className="text-sm text-gray-500">Open the editor and select {meta.name} from the mechanism picker.</p>
          </div>
          <Button onClick={() => navigate(`/create/editor?mechanism=${mechanismId}`)} className="flex-shrink-0">
            <ExternalLink className="w-4 h-4 mr-2" />
            Try in editor
          </Button>
        </div>

        <DiagramKey />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Drawing steps */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Part 1: Drawing</h2>
            <div className="space-y-4">
              {DRAWING_STEPS.map((step, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex gap-4">
                    <button
                      onClick={() => toggleStep(idx)}
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                        completedSteps.includes(idx) ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {completedSteps.includes(idx) && <Check className="w-5 h-5 text-white" />}
                    </button>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Step {idx + 1}: {step.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                      <InstructionDiagram type={step.diagram} design={null} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Assembly steps */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Part 2: Assembly</h2>
            <div className="space-y-4">
              {assembly.map((step, idx) => {
                const stepIdx = idx + DRAWING_STEPS.length;
                return (
                  <Card key={stepIdx} className="p-6">
                    <div className="flex gap-4">
                      <button
                        onClick={() => toggleStep(stepIdx)}
                        className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                          completedSteps.includes(stepIdx) ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {completedSteps.includes(stepIdx) && <Check className="w-5 h-5 text-white" />}
                      </button>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">Step {idx + 1}: {step.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                        <InstructionDiagram type={step.diagram} design={null} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Button size="lg" onClick={() => navigate(`/create/editor?mechanism=${mechanismId}`)}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Try this in the editor
          </Button>
        </div>
      </main>
    </div>
  );
}
