import { EmbeddedPanel } from "../components/EmbeddedPanel";
import { MACHINE_METRICS_URL } from "../../services/embeddedPanels";

export const MachineMetrics = () => (
  <EmbeddedPanel title="Machine Metrics" url={MACHINE_METRICS_URL} />
);

export default MachineMetrics;
