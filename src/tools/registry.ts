import { createElement, type ComponentType } from 'react';
import BreathTrainerPage from '../components/tools/BreathTrainerPage';
import FocusTimerPage from '../components/tools/FocusTimerPage';
import ScreenRulerPage from '../components/tools/ScreenRulerPage';
import AgeCalculatorPage from '../components/tools/AgeCalculatorPage';
import SpeedTestPage from '../components/tools/SpeedTestPage';
import IpFinderPage from '../components/tools/IpFinderPage';
import QRGeneratorPage from '../components/tools/QRGeneratorPage';
import PasswordGenPage from '../components/tools/PasswordGenPage';
import EMICalculatorPage from '../components/tools/EMICalculatorPage';
import BMICalculatorPage from '../components/tools/BMICalculatorPage';
import PingCheckerPage from '../components/tools/PingCheckerPage';
import GenericToolPage from '../components/tools/GenericToolPage';
import { CpsTest, ReactionGame, SystemInfoTool } from '../components/ToolsPage';

export interface ToolDefinition {
  id: string;
  title: string;
  icon: string;
  category: string;
  description: string;
  component?: ComponentType<{ onBack: () => void }>;
}

export interface ToolCategory {
  id: string;
  name: string;
  icon: string;
}

export function isToolReady(tool: ToolDefinition): boolean {
  return tool.component != null;
}

function wrapped(title: string, body: ComponentType): ComponentType<{ onBack: () => void }> {
  const Page = body;
  const Wrapped = ({ onBack }: { onBack: () => void }) =>
    createElement(GenericToolPage, { title, onBack, children: createElement(Page) });
  return Wrapped;
}

export const toolCategories: ToolCategory[] = [
  { id: 'quick', name: 'Quick tests', icon: '⚡' },
  { id: 'health', name: 'Health', icon: '🧠' },
  { id: 'prod', name: 'Productivity', icon: '⚙️' },
  { id: 'web', name: 'Internet', icon: '📱' },
  { id: 'calc', name: 'Math', icon: '🧮' },
  { id: 'sys', name: 'System', icon: '🌍' },
];

export const tools: ToolDefinition[] = [
  { id: 'reaction', category: 'quick', icon: '⚡', title: 'Reaction test', description: 'Test how fast you react.', component: wrapped('Reaction test', ReactionGame) },
  { id: 'cps', category: 'quick', icon: '🖱️', title: 'CPS test', description: 'Count your clicks per second.', component: wrapped('CPS test', CpsTest) },
  { id: 'breath', category: 'health', icon: '🫁', title: 'Breath Trainer', description: 'Guided 4-7-8 breathing for calmness.', component: BreathTrainerPage },
  { id: 'focus', category: 'health', icon: '🧘', title: 'Focus Timer', description: 'Pomodoro timer with ambient sounds.', component: FocusTimerPage },
  { id: 'ruler', category: 'prod', icon: '📏', title: 'Screen Ruler', description: 'Measure pixels on screen.', component: ScreenRulerPage },
  { id: 'age', category: 'prod', icon: '📅', title: 'Age Calculator', description: 'Calculate exact age and dates.', component: AgeCalculatorPage },
  { id: 'sys-info', category: 'prod', icon: '💻', title: 'System Info', description: 'Detailed device specs.', component: wrapped('System Info', SystemInfoTool) },
  { id: 'speed', category: 'web', icon: '🚀', title: 'Speed Test', description: 'Measure connection latency.', component: SpeedTestPage },
  { id: 'ip', category: 'web', icon: '🔒', title: 'IP Finder', description: 'Show public IP and ISP.', component: IpFinderPage },
  { id: 'qr', category: 'web', icon: '🧩', title: 'QR Generator', description: 'Create and scan QR codes.', component: QRGeneratorPage },
  { id: 'password-gen', category: 'web', icon: '🧱', title: 'Password Gen', description: 'Create strong secure passwords.', component: PasswordGenPage },
  { id: 'emi', category: 'calc', icon: '🧾', title: 'EMI Calculator', description: 'Loan installment estimator.', component: EMICalculatorPage },
  { id: 'bmi', category: 'calc', icon: '📈', title: 'BMI Calculator', description: 'Body Mass Index check.', component: BMICalculatorPage },
  { id: 'ping', category: 'sys', icon: '🧭', title: 'Ping Checker', description: 'Test server latency.', component: PingCheckerPage },
];

export function findTool(id: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.id === id);
}
