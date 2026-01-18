import { forwardRef } from 'react';

const PipelineGuide = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="bg-white text-black p-8 max-w-4xl mx-auto print:p-4">
      {/* Header */}
      <header className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MyRecruita</h1>
            <p className="text-lg text-gray-600">Candidate Pipeline User Guide</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Version 2.1</p>
            <p>Last Updated: January 2025</p>
          </div>
        </div>
      </header>

      {/* Table of Contents */}
      <nav className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Table of Contents</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Introduction</li>
          <li>Pipeline Overview</li>
          <li>Understanding Stages</li>
          <li>Adding Candidates to Pipeline</li>
          <li>Moving Between Stages</li>
          <li>Mandatory Stage Actions</li>
          <li>Interview Scorecards</li>
          <li>Placement Recording</li>
          <li>Pipeline Activity Log</li>
          <li>Best Practices</li>
          <li>Permissions Reference</li>
        </ol>
      </nav>

      {/* Section 1 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">1. Introduction</h2>
        <p className="mb-4">
          The Candidate Pipeline provides a visual Kanban-style board for tracking candidates 
          through the full recruitment lifecycle. From initial sourcing through to successful 
          placement, every stage is tracked with mandatory actions ensuring data quality.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="font-semibold">Key Features:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>12 distinct pipeline stages</li>
            <li>Drag-and-drop stage transitions</li>
            <li>Mandatory actions per stage</li>
            <li>Interview scorecard capture</li>
            <li>Automatic placement fee calculation</li>
          </ul>
        </div>
      </section>

      {/* Section 2 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">2. Pipeline Overview</h2>
        <h3 className="text-lg font-semibold mb-2">Accessing the Pipeline</h3>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Navigate to <strong>Pipeline</strong> in the sidebar</li>
          <li>Select a job to view its pipeline, or view all candidates</li>
          <li>Use filters to narrow down by stage, recruiter, or date</li>
        </ol>

        <h3 className="text-lg font-semibold mb-2">Pipeline Views</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Kanban Board</strong> - Visual columns for each stage</li>
          <li><strong>List View</strong> - Tabular view with sorting</li>
          <li><strong>Job-Specific</strong> - Pipeline for a single job</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section className="mb-8 break-before-page">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">3. Understanding Stages</h2>
        <p className="mb-4">The pipeline consists of 12 stages across three categories:</p>

        <h3 className="text-lg font-semibold mb-2">Active Stages</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Stage</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
              <th className="border border-gray-300 p-2 text-left">Colour</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Sourced</td>
              <td className="border border-gray-300 p-2">Identified as potential match</td>
              <td className="border border-gray-300 p-2">Slate</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Contacted</td>
              <td className="border border-gray-300 p-2">Initial outreach made</td>
              <td className="border border-gray-300 p-2">Blue</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Qualified</td>
              <td className="border border-gray-300 p-2">Screened and suitable</td>
              <td className="border border-gray-300 p-2">Cyan</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Submitted</td>
              <td className="border border-gray-300 p-2">CV sent to client</td>
              <td className="border border-gray-300 p-2">Indigo</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Interview 1</td>
              <td className="border border-gray-300 p-2">First interview scheduled/completed</td>
              <td className="border border-gray-300 p-2">Violet</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Interview 2</td>
              <td className="border border-gray-300 p-2">Second interview stage</td>
              <td className="border border-gray-300 p-2">Purple</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Final</td>
              <td className="border border-gray-300 p-2">Final round/assessment</td>
              <td className="border border-gray-300 p-2">Fuchsia</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Offer</td>
              <td className="border border-gray-300 p-2">Offer extended to candidate</td>
              <td className="border border-gray-300 p-2">Amber</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Accepted</td>
              <td className="border border-gray-300 p-2">Offer accepted, awaiting start</td>
              <td className="border border-gray-300 p-2">Lime</td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mb-2">Terminal Stages</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Stage</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
              <th className="border border-gray-300 p-2 text-left">Colour</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Placed</td>
              <td className="border border-gray-300 p-2">Successfully started role</td>
              <td className="border border-gray-300 p-2">Green</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Rejected</td>
              <td className="border border-gray-300 p-2">Not progressing</td>
              <td className="border border-gray-300 p-2">Red</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">On Hold</td>
              <td className="border border-gray-300 p-2">Temporarily paused</td>
              <td className="border border-gray-300 p-2">Orange</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 4 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">4. Adding Candidates to Pipeline</h2>
        <h3 className="text-lg font-semibold mb-2">From CV Matching</h3>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Run CV matching against a job</li>
          <li>Select candidates from results</li>
          <li>Click "Add to Pipeline"</li>
          <li>Candidates enter at "Sourced" stage</li>
        </ol>

        <h3 className="text-lg font-semibold mb-2">From Candidate Profile</h3>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Open candidate profile</li>
          <li>Click "Add to Pipeline" button</li>
          <li>Select the target job</li>
          <li>Choose initial stage (default: Sourced)</li>
        </ol>

        <h3 className="text-lg font-semibold mb-2">From Job Detail</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Open job detail page</li>
          <li>Go to Pipeline tab</li>
          <li>Click "Add Candidate"</li>
          <li>Search and select candidate</li>
        </ol>
      </section>

      {/* Section 5 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">5. Moving Between Stages</h2>
        <h3 className="text-lg font-semibold mb-2">Drag and Drop</h3>
        <p className="mb-4">
          Simply drag a candidate card from one column to another on the Kanban board.
        </p>

        <h3 className="text-lg font-semibold mb-2">Stage Transition Dialog</h3>
        <p className="mb-4">
          When moving to certain stages, a dialog will appear requiring mandatory information. 
          This ensures data quality and complete records.
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="font-semibold">⚠️ Important</p>
          <p className="text-sm mt-1">
            Some stage transitions are blocked until required fields are completed. 
            You cannot skip mandatory actions.
          </p>
        </div>
      </section>

      {/* Section 6 */}
      <section className="mb-8 break-before-page">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">6. Mandatory Stage Actions</h2>
        <p className="mb-4">
          The following stages require specific information before a candidate can progress:
        </p>

        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">To Stage</th>
              <th className="border border-gray-300 p-2 text-left">Required Fields</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Qualified</td>
              <td className="border border-gray-300 p-2">Screening notes, Salary expectation confirmed</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Submitted</td>
              <td className="border border-gray-300 p-2">Submission notes, Client contact confirmed</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Interview 1</td>
              <td className="border border-gray-300 p-2">Interview date/time, Interview type, Location/link</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Interview 2</td>
              <td className="border border-gray-300 p-2">Previous interview scorecard, New interview details</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Final</td>
              <td className="border border-gray-300 p-2">All previous scorecards, Final round details</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Offer</td>
              <td className="border border-gray-300 p-2">Offer salary, Start date, Benefits details</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Accepted</td>
              <td className="border border-gray-300 p-2">Confirmed salary, Confirmed start date</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Placed</td>
              <td className="border border-gray-300 p-2">Full placement form (see Section 8)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Rejected</td>
              <td className="border border-gray-300 p-2">Rejection reason, Category</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 7 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">7. Interview Scorecards</h2>
        <p className="mb-4">
          Capture detailed feedback after each interview stage using the scorecard system.
        </p>

        <h3 className="text-lg font-semibold mb-2">Scorecard Fields</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Field</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Interview Date</td>
              <td className="border border-gray-300 p-2">When the interview took place</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Interview Type</td>
              <td className="border border-gray-300 p-2">Phone, Video, In-person, Assessment</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Interviewer Name</td>
              <td className="border border-gray-300 p-2">Who conducted the interview</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Interviewer Role</td>
              <td className="border border-gray-300 p-2">Their position (HR, Hiring Manager, etc.)</td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mb-2">Rating Categories (1-5 Stars)</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><strong>Technical Skills</strong> - Job-specific competencies</li>
          <li><strong>Communication</strong> - Clarity and articulation</li>
          <li><strong>Cultural Fit</strong> - Team and company alignment</li>
          <li><strong>Experience Relevance</strong> - Background match</li>
          <li><strong>Motivation</strong> - Interest and enthusiasm</li>
          <li><strong>Overall Impression</strong> - General assessment</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Additional Fields</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Strengths</strong> - Key positives noted</li>
          <li><strong>Concerns</strong> - Areas of doubt</li>
          <li><strong>Questions Asked</strong> - Interview questions used</li>
          <li><strong>Candidate Questions</strong> - What they asked</li>
          <li><strong>Notes</strong> - General observations</li>
          <li><strong>Recommendation</strong> - Proceed, Hold, Reject</li>
          <li><strong>Next Steps</strong> - Suggested actions</li>
        </ul>
      </section>

      {/* Section 8 */}
      <section className="mb-8 break-before-page">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">8. Placement Recording</h2>
        <p className="mb-4">
          When marking a candidate as "Placed", complete placement details are required for 
          accurate revenue tracking and billing.
        </p>

        <h3 className="text-lg font-semibold mb-2">Required Placement Fields</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Field</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Start Date</td>
              <td className="border border-gray-300 p-2">When candidate starts the role</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Salary</td>
              <td className="border border-gray-300 p-2">Confirmed annual salary</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Fee Percentage</td>
              <td className="border border-gray-300 p-2">Agreed fee % (from client terms or custom)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Fee Value</td>
              <td className="border border-gray-300 p-2">Calculated: Salary × Fee %</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Invoice Date</td>
              <td className="border border-gray-300 p-2">When invoice will be raised (usually start date)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Guarantee Period</td>
              <td className="border border-gray-300 p-2">Rebate period in days (e.g., 90 days)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Rebate Percentage</td>
              <td className="border border-gray-300 p-2">Refund % if candidate leaves early</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Placed By</td>
              <td className="border border-gray-300 p-2">Team member who owns the placement</td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mb-2">Placement Tracking</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Invoice Raised</strong> - Date invoice was sent</li>
          <li><strong>Invoice Paid</strong> - Date payment received</li>
          <li><strong>Guarantee Expiry</strong> - Auto-calculated from start + period</li>
          <li><strong>Placement Notes</strong> - Any additional information</li>
        </ul>
      </section>

      {/* Section 9 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">9. Pipeline Activity Log</h2>
        <p className="mb-4">
          Every action on a pipeline entry is logged for audit and tracking purposes.
        </p>

        <h3 className="text-lg font-semibold mb-2">Logged Activities</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Stage changes (with from/to stages)</li>
          <li>Notes added</li>
          <li>Scorecards created</li>
          <li>Assignment changes</li>
          <li>Priority updates</li>
          <li>Placement created</li>
        </ul>
      </section>

      {/* Section 10 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">10. Best Practices</h2>
        <div className="space-y-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="font-semibold">✅ Do</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Complete all mandatory fields at each stage</li>
              <li>Add scorecards immediately after interviews</li>
              <li>Keep notes detailed and professional</li>
              <li>Update stages promptly to reflect reality</li>
              <li>Record rejection reasons for analytics</li>
            </ul>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="font-semibold">❌ Don't</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Skip stages without proper documentation</li>
              <li>Leave candidates in limbo stages</li>
              <li>Forget to mark placements</li>
              <li>Use vague rejection reasons</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 11 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">11. Permissions Reference</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Permission</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">pipeline.view</td>
              <td className="border border-gray-300 p-2">View pipeline entries</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">pipeline.manage</td>
              <td className="border border-gray-300 p-2">Add candidates, change stages</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">pipeline.delete</td>
              <td className="border border-gray-300 p-2">Remove entries from pipeline</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">placements.view</td>
              <td className="border border-gray-300 p-2">View placement records</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">placements.manage</td>
              <td className="border border-gray-300 p-2">Create and edit placements</td>
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

PipelineGuide.displayName = 'PipelineGuide';

export default PipelineGuide;
