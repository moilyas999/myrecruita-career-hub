import { forwardRef } from 'react';

const ReportsGuide = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="bg-white text-black p-8 max-w-4xl mx-auto print:p-4">
      {/* Header */}
      <header className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MyRecruita</h1>
            <p className="text-lg text-gray-600">Reports & Analytics User Guide</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Version 2.4</p>
            <p>Last Updated: January 2025</p>
          </div>
        </div>
      </header>

      {/* Table of Contents */}
      <nav className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Table of Contents</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Introduction</li>
          <li>Accessing Reports</li>
          <li>Revenue Forecast Dashboard</li>
          <li>Revenue Cards</li>
          <li>Revenue Trend Chart</li>
          <li>Placements by Client</li>
          <li>Invoice Status Table</li>
          <li>Performance Dashboard</li>
          <li>Recruiter Leaderboard</li>
          <li>Pipeline Metrics</li>
          <li>Conversion Funnel</li>
          <li>Report Filters</li>
          <li>Exporting Reports</li>
          <li>Permissions Reference</li>
        </ol>
      </nav>

      {/* Section 1 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">1. Introduction</h2>
        <p className="mb-4">
          The Reports & Analytics module provides comprehensive insights into recruitment 
          performance, revenue forecasting, and team productivity. Make data-driven decisions 
          with real-time dashboards and exportable reports.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="font-semibold">Key Features:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Monthly and quarterly revenue forecasts</li>
            <li>Recruiter performance tracking</li>
            <li>Pipeline conversion analytics</li>
            <li>Invoice tracking and aging</li>
            <li>Exportable reports (CSV/PDF)</li>
          </ul>
        </div>
      </section>

      {/* Section 2 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">2. Accessing Reports</h2>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Click <strong>Reports</strong> in the sidebar</li>
          <li>Choose between <strong>Revenue</strong> or <strong>Performance</strong> tabs</li>
          <li>Set date range and period filters</li>
          <li>View real-time data and charts</li>
        </ol>

        <h3 className="text-lg font-semibold mb-2">Report Types</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Revenue Forecast</strong> - Financial projections and actuals</li>
          <li><strong>Performance</strong> - Recruiter and team metrics</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section className="mb-8 break-before-page">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">3. Revenue Forecast Dashboard</h2>
        <p className="mb-4">
          The Revenue Forecast dashboard provides a complete view of confirmed, projected, 
          and pending revenue across your recruitment business.
        </p>

        <h3 className="text-lg font-semibold mb-2">Dashboard Components</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Revenue summary cards</li>
          <li>Trend chart (line/bar)</li>
          <li>Placements by client breakdown</li>
          <li>Invoice status table</li>
          <li>Monthly/quarterly comparison</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Period Options</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Period</th>
              <th className="border border-gray-300 p-2 text-left">View</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Weekly</td>
              <td className="border border-gray-300 p-2">Current week breakdown</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Monthly</td>
              <td className="border border-gray-300 p-2">Current month with daily breakdown</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Quarterly</td>
              <td className="border border-gray-300 p-2">Current quarter with monthly breakdown</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Yearly</td>
              <td className="border border-gray-300 p-2">Current year with quarterly breakdown</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 4 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">4. Revenue Cards</h2>
        <p className="mb-4">Three key revenue metrics are displayed as cards:</p>

        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Card</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
              <th className="border border-gray-300 p-2 text-left">Calculation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Confirmed Revenue</td>
              <td className="border border-gray-300 p-2">Placements made with invoices raised</td>
              <td className="border border-gray-300 p-2">Sum of placed candidate fees</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Projected Revenue</td>
              <td className="border border-gray-300 p-2">Expected from pipeline (weighted)</td>
              <td className="border border-gray-300 p-2">Fee × Stage probability</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Pending Invoices</td>
              <td className="border border-gray-300 p-2">Invoiced but not yet paid</td>
              <td className="border border-gray-300 p-2">Sum of unpaid invoices</td>
            </tr>
          </tbody>
        </table>

        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <p className="font-semibold">Revenue Calculation</p>
          <p className="text-sm mt-1">
            Confirmed = Placed candidates with invoice raised<br />
            Projected = Pipeline value × Stage probability<br />
            Total Forecast = Confirmed + Projected
          </p>
        </div>
      </section>

      {/* Section 5 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">5. Revenue Trend Chart</h2>
        <p className="mb-4">
          Visual representation of revenue over time with comparison options:
        </p>

        <h3 className="text-lg font-semibold mb-2">Chart Features</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Line chart showing revenue trend</li>
          <li>Comparison with previous period</li>
          <li>Confirmed vs projected breakdown</li>
          <li>Interactive tooltips with details</li>
          <li>Zoom and pan capabilities</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Data Series</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Confirmed</strong> - Actual placements made</li>
          <li><strong>Projected</strong> - Pipeline-based forecast</li>
          <li><strong>Target</strong> - If targets are set</li>
          <li><strong>Previous Period</strong> - Year-on-year comparison</li>
        </ul>
      </section>

      {/* Section 6 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">6. Placements by Client</h2>
        <p className="mb-4">
          Breakdown of placements and revenue by client:
        </p>

        <h3 className="text-lg font-semibold mb-2">Chart Types</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><strong>Pie Chart</strong> - Proportion of total</li>
          <li><strong>Bar Chart</strong> - Ranked by value</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Metrics Shown</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Client name</li>
          <li>Placement count</li>
          <li>Total revenue</li>
          <li>% of total</li>
        </ul>
      </section>

      {/* Section 7 */}
      <section className="mb-8 break-before-page">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">7. Invoice Status Table</h2>
        <p className="mb-4">
          Track all invoices with aging and payment status:
        </p>

        <h3 className="text-lg font-semibold mb-2">Table Columns</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Column</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Candidate</td>
              <td className="border border-gray-300 p-2">Placed candidate name</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Client</td>
              <td className="border border-gray-300 p-2">Client company</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Fee Value</td>
              <td className="border border-gray-300 p-2">Invoice amount</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Invoice Date</td>
              <td className="border border-gray-300 p-2">When invoice was raised</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Due Date</td>
              <td className="border border-gray-300 p-2">Payment due date</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Status</td>
              <td className="border border-gray-300 p-2">Pending, Paid, Overdue</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Days Overdue</td>
              <td className="border border-gray-300 p-2">If past due date</td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mb-2">Invoice Status</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span><strong>Pending</strong> - Awaiting payment</li>
          <li><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span><strong>Paid</strong> - Payment received</li>
          <li><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span><strong>Overdue</strong> - Past due date</li>
        </ul>
      </section>

      {/* Section 8 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">8. Performance Dashboard</h2>
        <p className="mb-4">
          Track recruiter and team performance with detailed metrics:
        </p>

        <h3 className="text-lg font-semibold mb-2">Dashboard Components</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Recruiter leaderboard</li>
          <li>Pipeline metrics</li>
          <li>Conversion funnel</li>
          <li>Activity metrics</li>
          <li>Time-to-fill trends</li>
        </ul>
      </section>

      {/* Section 9 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">9. Recruiter Leaderboard</h2>
        <p className="mb-4">
          Rank recruiters by key performance indicators:
        </p>

        <h3 className="text-lg font-semibold mb-2">Leaderboard Metrics</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Metric</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Placements</td>
              <td className="border border-gray-300 p-2">Total placements made</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Revenue</td>
              <td className="border border-gray-300 p-2">Total fees generated</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Submissions</td>
              <td className="border border-gray-300 p-2">CVs submitted to clients</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Interviews</td>
              <td className="border border-gray-300 p-2">Interviews secured</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Conversion Rate</td>
              <td className="border border-gray-300 p-2">% of submissions to placement</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Avg Time to Fill</td>
              <td className="border border-gray-300 p-2">Average days to placement</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 10 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">10. Pipeline Metrics</h2>
        <p className="mb-4">
          Overview of current pipeline health:
        </p>

        <ul className="list-disc list-inside space-y-1">
          <li><strong>Total Active Candidates</strong> - In active pipeline stages</li>
          <li><strong>Stage Distribution</strong> - Count per stage</li>
          <li><strong>Avg Days in Stage</strong> - Time spent at each stage</li>
          <li><strong>Stalled Candidates</strong> - No movement in X days</li>
          <li><strong>Pipeline Value</strong> - Total projected revenue</li>
        </ul>
      </section>

      {/* Section 11 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">11. Conversion Funnel</h2>
        <p className="mb-4">
          Visualise the recruitment funnel from sourcing to placement:
        </p>

        <h3 className="text-lg font-semibold mb-2">Funnel Stages</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Stage</th>
              <th className="border border-gray-300 p-2 text-left">Typical Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Sourced → Contacted</td>
              <td className="border border-gray-300 p-2">80%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Contacted → Qualified</td>
              <td className="border border-gray-300 p-2">50%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Qualified → Submitted</td>
              <td className="border border-gray-300 p-2">70%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Submitted → Interview</td>
              <td className="border border-gray-300 p-2">30%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Interview → Offer</td>
              <td className="border border-gray-300 p-2">25%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Offer → Placed</td>
              <td className="border border-gray-300 p-2">85%</td>
            </tr>
          </tbody>
        </table>

        <p className="text-sm italic">
          Note: Rates shown are typical benchmarks. Your actual rates are calculated from your data.
        </p>
      </section>

      {/* Section 12 */}
      <section className="mb-8 break-before-page">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">12. Report Filters</h2>
        <p className="mb-4">Customise reports with these filter options:</p>

        <ul className="list-disc list-inside space-y-1">
          <li><strong>Date Range</strong> - Start and end dates</li>
          <li><strong>Period</strong> - Weekly, Monthly, Quarterly, Yearly</li>
          <li><strong>Recruiter</strong> - Filter by team member</li>
          <li><strong>Client</strong> - Filter by client</li>
          <li><strong>Job Type</strong> - Permanent, Contract</li>
          <li><strong>Sector</strong> - Industry filter</li>
        </ul>
      </section>

      {/* Section 13 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">13. Exporting Reports</h2>
        <p className="mb-4">Export data for external analysis or reporting:</p>

        <h3 className="text-lg font-semibold mb-2">Export Formats</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><strong>CSV</strong> - For Excel/spreadsheet analysis</li>
          <li><strong>PDF</strong> - For sharing/printing</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">What's Exported</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>All visible data based on current filters</li>
          <li>Summary metrics</li>
          <li>Chart data (as tables)</li>
        </ul>
      </section>

      {/* Section 14 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">14. Permissions Reference</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Permission</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">reports.view</td>
              <td className="border border-gray-300 p-2">View reports and dashboards</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">reports.export</td>
              <td className="border border-gray-300 p-2">Export reports to CSV/PDF</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">reports.all_data</td>
              <td className="border border-gray-300 p-2">View all recruiter data (not just own)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">reports.financial</td>
              <td className="border border-gray-300 p-2">View revenue and invoice data</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Footer */}
      <footer className="border-t pt-4 mt-8 text-sm text-gray-500 text-center">
        <p>© 2025 MyRecruita. All rights reserved.</p>
        <p>For support, contact your system administrator.</p>
      </footer>
    </div>
  );
});

ReportsGuide.displayName = 'ReportsGuide';

export default ReportsGuide;
