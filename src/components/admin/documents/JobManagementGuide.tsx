import { forwardRef } from 'react';

const JobManagementGuide = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="bg-white text-black p-8 max-w-4xl mx-auto print:p-4">
      {/* Header */}
      <header className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MyRecruita</h1>
            <p className="text-lg text-gray-600">Job Management User Guide</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Version 2.2</p>
            <p>Last Updated: January 2025</p>
          </div>
        </div>
      </header>

      {/* Table of Contents */}
      <nav className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Table of Contents</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Introduction</li>
          <li>Accessing Jobs</li>
          <li>Creating a Job</li>
          <li>Job Detail Page</li>
          <li>Job Metrics Dashboard</li>
          <li>CV Submissions Tracking</li>
          <li>Interview Progress</li>
          <li>Rejection Analytics</li>
          <li>Offer Tracking</li>
          <li>Role Ageing</li>
          <li>Revenue Forecasting</li>
          <li>Job Filters</li>
          <li>Permissions Reference</li>
        </ol>
      </nav>

      {/* Section 1 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">1. Introduction</h2>
        <p className="mb-4">
          The Job Management module provides comprehensive tools for tracking job requisitions 
          from intake to fill. Monitor submissions, interviews, offers, and revenue with 
          detailed analytics.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="font-semibold">Key Features:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Full job lifecycle management</li>
            <li>CVs submitted per role tracking</li>
            <li>Interview and offer progress</li>
            <li>Rejection reason analysis</li>
            <li>Role ageing alerts</li>
            <li>Time-to-fill metrics</li>
            <li>Revenue forecasting</li>
          </ul>
        </div>
      </section>

      {/* Section 2 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">2. Accessing Jobs</h2>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Click <strong>Jobs</strong> in the sidebar</li>
          <li>View all jobs in a filterable list</li>
          <li>Use quick filters for status, client, priority</li>
          <li>Click a job to view full details</li>
        </ol>

        <h3 className="text-lg font-semibold mb-2">Job List View</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Job title and reference</li>
          <li>Client name</li>
          <li>Status (Open, On Hold, Closed, Filled)</li>
          <li>Priority (Low, Medium, High, Urgent)</li>
          <li>CVs submitted count</li>
          <li>Interviews scheduled</li>
          <li>Days open (ageing)</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section className="mb-8 break-before-page">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">3. Creating a Job</h2>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Click <strong>Add Job</strong> button</li>
          <li>Complete the job form</li>
          <li>Link to client (required)</li>
          <li>Assign to recruiter</li>
          <li>Click <strong>Save</strong></li>
        </ol>

        <h3 className="text-lg font-semibold mb-2">Job Form Fields</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Field</th>
              <th className="border border-gray-300 p-2 text-left">Required</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Job Title</td>
              <td className="border border-gray-300 p-2">Yes</td>
              <td className="border border-gray-300 p-2">Position title</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Client</td>
              <td className="border border-gray-300 p-2">Yes</td>
              <td className="border border-gray-300 p-2">Link to client record</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Hiring Manager</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Client contact for this role</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Location</td>
              <td className="border border-gray-300 p-2">Yes</td>
              <td className="border border-gray-300 p-2">Work location</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Work Type</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">On-site, Hybrid, Remote</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Job Type</td>
              <td className="border border-gray-300 p-2">Yes</td>
              <td className="border border-gray-300 p-2">Permanent, Contract, Temp-to-Perm</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Salary Range</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Min and max salary</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Fee %</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Agreed fee (defaults from client terms)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Description</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Full job specification</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Requirements</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Must-have skills and experience</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Priority</td>
              <td className="border border-gray-300 p-2">Yes</td>
              <td className="border border-gray-300 p-2">Low, Medium, High, Urgent</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Assigned To</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Recruiter working the role</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Target Fill Date</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">When client wants role filled</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 4 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">4. Job Detail Page</h2>
        <p className="mb-4">The job detail page is organised into tabs:</p>

        <h3 className="text-lg font-semibold mb-2">Overview Tab</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Job header with status and priority</li>
          <li>Key metrics cards</li>
          <li>Full job description</li>
          <li>Requirements list</li>
          <li>Timeline of activity</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Candidates Tab</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>All candidates in pipeline for this job</li>
          <li>Stage breakdown</li>
          <li>Quick actions (move stage, add notes)</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Submissions Tab</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>CVs submitted to client</li>
          <li>Client response tracking</li>
          <li>Rejection reasons</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Analytics Tab</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Conversion funnel</li>
          <li>Time in each stage</li>
          <li>Source analysis</li>
        </ul>
      </section>

      {/* Section 5 */}
      <section className="mb-8 break-before-page">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">5. Job Metrics Dashboard</h2>
        <p className="mb-4">Key metrics displayed for each job:</p>

        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Metric</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">CVs Sourced</td>
              <td className="border border-gray-300 p-2">Total candidates identified</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">CVs Submitted</td>
              <td className="border border-gray-300 p-2">Sent to client</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Submission Rate</td>
              <td className="border border-gray-300 p-2">% of sourced that were submitted</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Interview Rate</td>
              <td className="border border-gray-300 p-2">% of submitted that got interviews</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Interviews Scheduled</td>
              <td className="border border-gray-300 p-2">Total interviews (all stages)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Offers Extended</td>
              <td className="border border-gray-300 p-2">Number of offers made</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Offer-to-Accept Rate</td>
              <td className="border border-gray-300 p-2">% of offers accepted</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Days Open</td>
              <td className="border border-gray-300 p-2">Time since job created</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Time to Fill</td>
              <td className="border border-gray-300 p-2">Days from open to placement</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Projected Revenue</td>
              <td className="border border-gray-300 p-2">Estimated fee if filled</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 6 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">6. CV Submissions Tracking</h2>
        <p className="mb-4">
          Track every CV sent to clients with response tracking:
        </p>

        <h3 className="text-lg font-semibold mb-2">Submission Record</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Candidate name and CV link</li>
          <li>Date submitted</li>
          <li>Submitted by (recruiter)</li>
          <li>Submission notes</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Client Response Tracking</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Status</th>
              <th className="border border-gray-300 p-2 text-left">Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Pending</td>
              <td className="border border-gray-300 p-2">Awaiting client feedback</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Shortlisted</td>
              <td className="border border-gray-300 p-2">Client interested, moving forward</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Rejected</td>
              <td className="border border-gray-300 p-2">Client passed on candidate</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Interview</td>
              <td className="border border-gray-300 p-2">Interview scheduled</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 7 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">7. Interview Progress</h2>
        <p className="mb-4">
          Track all interview stages for candidates on this job:
        </p>

        <ul className="list-disc list-inside space-y-1">
          <li>Interview 1 scheduled/completed count</li>
          <li>Interview 2 scheduled/completed count</li>
          <li>Final stage count</li>
          <li>Average time between stages</li>
          <li>Drop-off at each stage</li>
        </ul>
      </section>

      {/* Section 8 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">8. Rejection Analytics</h2>
        <p className="mb-4">
          Understand why candidates are rejected to improve sourcing:
        </p>

        <h3 className="text-lg font-semibold mb-2">Rejection Categories</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Category</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Skills Mismatch</td>
              <td className="border border-gray-300 p-2">Technical skills don't match</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Experience</td>
              <td className="border border-gray-300 p-2">Too junior or senior</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Salary</td>
              <td className="border border-gray-300 p-2">Expectations too high</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Cultural Fit</td>
              <td className="border border-gray-300 p-2">Not right for team/company</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Notice Period</td>
              <td className="border border-gray-300 p-2">Can't start soon enough</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Location</td>
              <td className="border border-gray-300 p-2">Can't commute or relocate</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Candidate Withdrew</td>
              <td className="border border-gray-300 p-2">Candidate pulled out</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Role Filled</td>
              <td className="border border-gray-300 p-2">Position filled by another</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Role Cancelled</td>
              <td className="border border-gray-300 p-2">Client cancelled the role</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Other</td>
              <td className="border border-gray-300 p-2">Other reasons (specify)</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 9 */}
      <section className="mb-8 break-before-page">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">9. Offer Tracking</h2>
        <p className="mb-4">
          Track offers from extension through acceptance:
        </p>

        <h3 className="text-lg font-semibold mb-2">Offer Details Captured</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Offer salary</li>
          <li>Start date proposed</li>
          <li>Benefits package</li>
          <li>Offer expiry date</li>
          <li>Negotiation notes</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Offer Status Flow</h3>
        <p className="font-mono bg-gray-100 p-2 rounded text-sm">
          Offer Extended → Negotiating → Accepted / Declined
        </p>
      </section>

      {/* Section 10 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">10. Role Ageing</h2>
        <p className="mb-4">
          Monitor how long jobs have been open to prioritise effort:
        </p>

        <h3 className="text-lg font-semibold mb-2">Ageing Categories</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Category</th>
              <th className="border border-gray-300 p-2 text-left">Days Open</th>
              <th className="border border-gray-300 p-2 text-left">Indicator</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Fresh</td>
              <td className="border border-gray-300 p-2">0-14 days</td>
              <td className="border border-gray-300 p-2">🟢 Green</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Active</td>
              <td className="border border-gray-300 p-2">15-30 days</td>
              <td className="border border-gray-300 p-2">🟡 Yellow</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Ageing</td>
              <td className="border border-gray-300 p-2">31-60 days</td>
              <td className="border border-gray-300 p-2">🟠 Orange</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Stale</td>
              <td className="border border-gray-300 p-2">60+ days</td>
              <td className="border border-gray-300 p-2">🔴 Red</td>
            </tr>
          </tbody>
        </table>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="font-semibold">⚠️ Role Ageing Alerts</p>
          <p className="text-sm mt-1">
            Automation rules can be configured to alert when roles enter the "Ageing" 
            or "Stale" categories. See Automation Guide.
          </p>
        </div>
      </section>

      {/* Section 11 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">11. Revenue Forecasting</h2>
        <p className="mb-4">
          Project revenue based on pipeline position and probability:
        </p>

        <h3 className="text-lg font-semibold mb-2">Probability by Stage</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Stage</th>
              <th className="border border-gray-300 p-2 text-left">Win Probability</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Submitted</td>
              <td className="border border-gray-300 p-2">10%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Interview 1</td>
              <td className="border border-gray-300 p-2">25%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Interview 2</td>
              <td className="border border-gray-300 p-2">50%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Final</td>
              <td className="border border-gray-300 p-2">70%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Offer</td>
              <td className="border border-gray-300 p-2">80%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Accepted</td>
              <td className="border border-gray-300 p-2">95%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Placed</td>
              <td className="border border-gray-300 p-2">100%</td>
            </tr>
          </tbody>
        </table>

        <p className="text-sm">
          <strong>Forecast Formula:</strong> Expected Revenue = Fee Value × Stage Probability
        </p>
      </section>

      {/* Section 12 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">12. Job Filters</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Status</strong> - Open, On Hold, Closed, Filled</li>
          <li><strong>Priority</strong> - Low, Medium, High, Urgent</li>
          <li><strong>Client</strong> - Filter by specific client</li>
          <li><strong>Recruiter</strong> - Assigned team member</li>
          <li><strong>Job Type</strong> - Permanent, Contract</li>
          <li><strong>Date Range</strong> - Created date filter</li>
          <li><strong>Ageing</strong> - Fresh, Active, Ageing, Stale</li>
        </ul>
      </section>

      {/* Section 13 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">13. Permissions Reference</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Permission</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">jobs.view</td>
              <td className="border border-gray-300 p-2">View job listings and details</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">jobs.manage</td>
              <td className="border border-gray-300 p-2">Create and edit jobs</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">jobs.delete</td>
              <td className="border border-gray-300 p-2">Delete job records</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">jobs.analytics</td>
              <td className="border border-gray-300 p-2">View job metrics and analytics</td>
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

JobManagementGuide.displayName = 'JobManagementGuide';

export default JobManagementGuide;
