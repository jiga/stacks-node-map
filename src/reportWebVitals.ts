import { Metric } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: (metric: Metric) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // getLargestContentfulPaint(onPerfEntry);
    // getFirstInputDelay(onPerfEntry);
    // getCumulativeLayoutShift(onPerfEntry);
    // getServerResponseTime(onPerfEntry);
  }
}

export default reportWebVitals;