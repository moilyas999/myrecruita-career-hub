import { forwardRef } from 'react';

const ClientCRMGuide = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="bg-white text-black p-8 max-w-4xl mx-auto print:p-4">
      {/* Header */}
      <header className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MyRecruita</h1>
            <p className="text-lg text-gray-600">Client CRM User Guide</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Version 2.0</p>
            <p>Last Updated: January 2025</p>
          </div>
        </div>
      </header>

      {/* Table of Contents */}
      <nav className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Table of Contents</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Introduction</li>
          <li>Accessing Client Management</li>
          <li>Creating a Client</li>
          <li>Client Overview</li>
          <li>Contacts Management</li>
          <li>Terms & Fees</li>
          <li>PSL Status</li>
          <li>Interaction Logging</li>
          <li>Jobs History</li>
          <li>Best Practices</li>
          <li>Permissions Reference</li>
        </ol>
      </nav>

      {/* Section 1 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">1. Introduction</h2>
        <p className="mb-4">
          The Client CRM module provides comprehensive client relationship management 
          capabilities. Track client profiles, contacts, commercial terms, PSL status, 
          and maintain a complete interaction history.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="font-semibold">Key Features:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Client profiles with company information</li>
            <li>Multiple contacts per client (hiring managers, etc.)</li>
            <li>Customisable terms and fee structures</li>
            <li>PSL (Preferred Supplier List) tracking</li>
            <li>Complete interaction logging</li>
            <li>Job history per client</li>
          </ul>
        </div>
      </section>

      {/* Section 2 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">2. Accessing Client Management</h2>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Click <strong>Clients</strong> in the sidebar navigation</li>
          <li>The client list shows all clients with key information</li>
          <li>Use search and filters to find specific clients</li>
          <li>Click a client name to view their full profile</li>
        </ol>

        <h3 className="text-lg font-semibold mb-2">Client List Columns</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Company Name</li>
          <li>Industry</li>
          <li>Status (Active, Prospect, Inactive, Former)</li>
          <li>PSL Status</li>
          <li>Account Manager</li>
          <li>Total Placements</li>
          <li>Last Contact Date</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">3. Creating a Client</h2>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Click <strong>Add Client</strong> button</li>
          <li>Complete the client form</li>
          <li>Click <strong>Save</strong></li>
        </ol>

        <h3 className="text-lg font-semibold mb-2">Client Form Fields</h3>
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
              <td className="border border-gray-300 p-2 font-medium">Company Name</td>
              <td className="border border-gray-300 p-2">Yes</td>
              <td className="border border-gray-300 p-2">Legal company name</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Industry</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Sector (Finance, Tech, etc.)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Company Size</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">SME, Mid-Market, Enterprise</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Website</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Company website URL</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Address</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Street, City, Postcode, Country</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Status</td>
              <td className="border border-gray-300 p-2">Yes</td>
              <td className="border border-gray-300 p-2">Active, Prospect, Inactive, Former</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Account Manager</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Assigned team member</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Source</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">How client was acquired</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 4 */}
      <section className="mb-8 break-before-page">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">4. Client Overview</h2>
        <p className="mb-4">The client profile page shows:</p>

        <h3 className="text-lg font-semibold mb-2">Header Information</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Company name and logo</li>
          <li>Industry and size badges</li>
          <li>Status indicator</li>
          <li>PSL status badge</li>
          <li>Quick action buttons</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Key Metrics</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><strong>Total Placements</strong> - All-time placements made</li>
          <li><strong>Lifetime Revenue</strong> - Total fees earned</li>
          <li><strong>Active Jobs</strong> - Current open positions</li>
          <li><strong>Last Placement</strong> - Most recent hire date</li>
          <li><strong>Last Contact</strong> - Most recent interaction</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Profile Tabs</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Overview</strong> - Summary and details</li>
          <li><strong>Contacts</strong> - All contacts at this client</li>
          <li><strong>Terms</strong> - Fee structures and agreements</li>
          <li><strong>Interactions</strong> - Communication history</li>
          <li><strong>Jobs</strong> - Historical and current jobs</li>
        </ul>
      </section>

      {/* Section 5 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">5. Contacts Management</h2>
        <p className="mb-4">
          Store multiple contacts per client including hiring managers, HR, and procurement.
        </p>

        <h3 className="text-lg font-semibold mb-2">Contact Fields</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Field</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Name</td>
              <td className="border border-gray-300 p-2">Contact's full name</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Job Title</td>
              <td className="border border-gray-300 p-2">Their role at the company</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Department</td>
              <td className="border border-gray-300 p-2">Finance, HR, Operations, etc.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Email</td>
              <td className="border border-gray-300 p-2">Work email address</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Phone</td>
              <td className="border border-gray-300 p-2">Direct line</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Mobile</td>
              <td className="border border-gray-300 p-2">Mobile number</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">LinkedIn</td>
              <td className="border border-gray-300 p-2">LinkedIn profile URL</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Is Primary</td>
              <td className="border border-gray-300 p-2">Main point of contact</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Is Billing Contact</td>
              <td className="border border-gray-300 p-2">Receives invoices</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Preferred Contact Method</td>
              <td className="border border-gray-300 p-2">Email, Phone, LinkedIn, WhatsApp</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 6 */}
      <section className="mb-8 break-before-page">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">6. Terms & Fees</h2>
        <p className="mb-4">
          Each client can have multiple fee structures for different job types or agreements.
        </p>

        <h3 className="text-lg font-semibold mb-2">Terms Fields</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Field</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Terms Name</td>
              <td className="border border-gray-300 p-2">Identifier (e.g., "Standard Terms 2025")</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Job Type</td>
              <td className="border border-gray-300 p-2">Permanent, Contract, or Both</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Fee % (Perm)</td>
              <td className="border border-gray-300 p-2">Percentage of annual salary</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Fee % (Contract)</td>
              <td className="border border-gray-300 p-2">Margin on day rate</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Flat Fee</td>
              <td className="border border-gray-300 p-2">Alternative to percentage</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Min Salary Threshold</td>
              <td className="border border-gray-300 p-2">Minimum salary for % fee</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Max Salary Cap</td>
              <td className="border border-gray-300 p-2">Maximum fee-able salary</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Payment Terms</td>
              <td className="border border-gray-300 p-2">Days until payment due (e.g., 30)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Rebate Period</td>
              <td className="border border-gray-300 p-2">Guarantee period in days</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Rebate %</td>
              <td className="border border-gray-300 p-2">Refund percentage if early leave</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Effective From</td>
              <td className="border border-gray-300 p-2">Start date of terms</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Effective Until</td>
              <td className="border border-gray-300 p-2">Expiry date (if any)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Is Exclusive</td>
              <td className="border border-gray-300 p-2">Exclusive supplier agreement</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 7 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">7. PSL Status</h2>
        <p className="mb-4">
          Track Preferred Supplier List status to identify key account targets.
        </p>

        <h3 className="text-lg font-semibold mb-2">PSL Status Options</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Status</th>
              <th className="border border-gray-300 p-2 text-left">Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Not on PSL</td>
              <td className="border border-gray-300 p-2">No preferred supplier agreement</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Pending</td>
              <td className="border border-gray-300 p-2">Application submitted, awaiting decision</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">On PSL</td>
              <td className="border border-gray-300 p-2">Active preferred supplier</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Expired</td>
              <td className="border border-gray-300 p-2">PSL status has lapsed</td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mb-2">PSL Tracking Fields</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>PSL Achieved At</strong> - Date added to PSL</li>
          <li><strong>PSL Expires At</strong> - Renewal date</li>
          <li><strong>PSL Notes</strong> - Agreement details</li>
        </ul>
      </section>

      {/* Section 8 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">8. Interaction Logging</h2>
        <p className="mb-4">
          Record all client communications for relationship tracking.
        </p>

        <h3 className="text-lg font-semibold mb-2">Interaction Types</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Phone Call</li>
          <li>Email</li>
          <li>Meeting (In-person)</li>
          <li>Video Call</li>
          <li>LinkedIn Message</li>
          <li>Other</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Interaction Fields</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Type</strong> - Communication method</li>
          <li><strong>Direction</strong> - Inbound or Outbound</li>
          <li><strong>Contact</strong> - Which contact was spoken to</li>
          <li><strong>Subject</strong> - Brief topic</li>
          <li><strong>Summary</strong> - Detailed notes</li>
          <li><strong>Outcome</strong> - Result of interaction</li>
          <li><strong>Duration</strong> - Time spent (optional)</li>
          <li><strong>Follow-up Required</strong> - Flag for action</li>
          <li><strong>Follow-up Date</strong> - When to follow up</li>
        </ul>
      </section>

      {/* Section 9 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">9. Jobs History</h2>
        <p className="mb-4">
          View all jobs (past and present) linked to this client.
        </p>

        <h3 className="text-lg font-semibold mb-2">Information Shown</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Job title and reference</li>
          <li>Date received</li>
          <li>Status (Open, Closed, Filled)</li>
          <li>Candidates submitted</li>
          <li>Placements made</li>
          <li>Revenue generated</li>
        </ul>
      </section>

      {/* Section 10 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">10. Best Practices</h2>
        <div className="space-y-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="font-semibold">✅ Do</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Log all significant interactions</li>
              <li>Keep contact information up-to-date</li>
              <li>Review terms before quoting fees</li>
              <li>Track PSL renewal dates</li>
              <li>Assign account managers to key clients</li>
            </ul>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="font-semibold">❌ Don't</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Create duplicate client records</li>
              <li>Leave client status outdated</li>
              <li>Forget to update PSL expiry dates</li>
              <li>Skip interaction logging</li>
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
              <td className="border border-gray-300 p-2 font-mono text-xs">clients.view</td>
              <td className="border border-gray-300 p-2">View client profiles and list</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">clients.manage</td>
              <td className="border border-gray-300 p-2">Create and edit clients</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">clients.delete</td>
              <td className="border border-gray-300 p-2">Delete client records</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">clients.terms</td>
              <td className="border border-gray-300 p-2">View and manage commercial terms</td>
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

ClientCRMGuide.displayName = 'ClientCRMGuide';

export default ClientCRMGuide;
