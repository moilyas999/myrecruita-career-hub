import { forwardRef } from 'react';

const CandidateProfileGuide = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="bg-white text-black p-8 max-w-4xl mx-auto print:p-4">
      {/* Header */}
      <header className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MyRecruita</h1>
            <p className="text-lg text-gray-600">CV Database & Candidate Profile Guide</p>
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
          <li>Accessing Candidate Profiles</li>
          <li>Profile Overview</li>
          <li>Work Authorisation</li>
          <li>Compensation & Availability</li>
          <li>Qualifications & Certifications</li>
          <li>Employment History</li>
          <li>GDPR Compliance</li>
          <li>Duplicate Detection</li>
          <li>AI Profile & CV Scoring</li>
          <li>Permissions Reference</li>
        </ol>
      </nav>

      {/* Section 1 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">1. Introduction</h2>
        <p className="mb-4">
          The Candidate Profile system provides a comprehensive 360-degree view of each candidate 
          in your database. Unlike basic CV submission views, the full profile page consolidates 
          all candidate information including work authorisation, qualifications, employment history, 
          and GDPR compliance status.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="font-semibold">Key Benefits:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Complete candidate overview in one place</li>
            <li>Quick visa/right-to-work status checks</li>
            <li>Qualification tracking with exam status</li>
            <li>Employment history timeline with job-hopping detection</li>
            <li>GDPR compliance monitoring and tools</li>
          </ul>
        </div>
      </section>

      {/* Section 2 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">2. Accessing Candidate Profiles</h2>
        <h3 className="text-lg font-semibold mb-2">From Talent Management</h3>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Navigate to <strong>Talent</strong> in the sidebar</li>
          <li>Find the candidate in the list or use search/filters</li>
          <li>Click the candidate's name or the <strong>View Profile</strong> button</li>
        </ol>
        
        <h3 className="text-lg font-semibold mb-2">From Pipeline</h3>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Open any pipeline card</li>
          <li>Click the candidate name link in the detail sheet</li>
        </ol>

        <h3 className="text-lg font-semibold mb-2">Direct URL</h3>
        <p className="font-mono bg-gray-100 p-2 rounded text-sm">
          /admin/candidate/[candidate-id]
        </p>
      </section>

      {/* Section 3 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">3. Profile Overview</h2>
        <p className="mb-4">
          The Profile Header displays key information at a glance:
        </p>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Element</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Name & Title</td>
              <td className="border border-gray-300 p-2">Candidate's full name and current/desired job title</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Contact Info</td>
              <td className="border border-gray-300 p-2">Email, phone number, location</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">CV Score Badge</td>
              <td className="border border-gray-300 p-2">Overall CV quality score (0-100)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Quick Actions</td>
              <td className="border border-gray-300 p-2">Download CV, Add to Pipeline, Edit Profile</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Status Badges</td>
              <td className="border border-gray-300 p-2">Visa status, availability, GDPR consent</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 4 */}
      <section className="mb-8 break-before-page">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">4. Work Authorisation</h2>
        <p className="mb-4">
          The Work Authorisation Card provides instant visibility into a candidate's right to work 
          status with clear visual indicators.
        </p>
        
        <h3 className="text-lg font-semibold mb-2">Right to Work Status</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Status</th>
              <th className="border border-gray-300 p-2 text-left">Indicator</th>
              <th className="border border-gray-300 p-2 text-left">Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">UK Citizen</td>
              <td className="border border-gray-300 p-2">✅ Green</td>
              <td className="border border-gray-300 p-2">Full right to work, no restrictions</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Settled Status</td>
              <td className="border border-gray-300 p-2">✅ Green</td>
              <td className="border border-gray-300 p-2">EU settled status holder</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Pre-Settled</td>
              <td className="border border-gray-300 p-2">⚠️ Amber</td>
              <td className="border border-gray-300 p-2">Temporary status, check expiry</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Work Visa</td>
              <td className="border border-gray-300 p-2">⚠️ Amber</td>
              <td className="border border-gray-300 p-2">Valid visa, check expiry date</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Requires Sponsorship</td>
              <td className="border border-gray-300 p-2">🔴 Red</td>
              <td className="border border-gray-300 p-2">Needs employer sponsorship</td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mb-2">Visa Types Tracked</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><strong>Skilled Worker Visa</strong> - Most common work visa</li>
          <li><strong>Global Talent</strong> - For exceptional talent</li>
          <li><strong>Graduate Visa</strong> - 2-year post-study work</li>
          <li><strong>Spouse/Partner</strong> - Dependant visa</li>
          <li><strong>Student</strong> - Limited work hours</li>
        </ul>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="font-semibold">⚠️ Expiry Alerts</p>
          <p className="text-sm mt-1">
            The system automatically highlights visas expiring within 90 days. 
            Check the expiry date before submitting candidates to clients.
          </p>
        </div>
      </section>

      {/* Section 5 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">5. Compensation & Availability</h2>
        <p className="mb-4">The Compensation Card tracks financial expectations and availability:</p>
        
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Field</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Current Salary</td>
              <td className="border border-gray-300 p-2">What they're currently earning</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Salary Expectation</td>
              <td className="border border-gray-300 p-2">Desired salary for next role</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Notice Period</td>
              <td className="border border-gray-300 p-2">Time required before starting (Immediate, 1 week, 1 month, etc.)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Available From</td>
              <td className="border border-gray-300 p-2">Earliest possible start date</td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mb-2">Notice Period Options</h3>
        <ul className="grid grid-cols-2 gap-2 text-sm">
          <li>• Immediate</li>
          <li>• 1 Week</li>
          <li>• 2 Weeks</li>
          <li>• 1 Month</li>
          <li>• 6 Weeks</li>
          <li>• 2 Months</li>
          <li>• 3 Months</li>
          <li>• 6 Months</li>
        </ul>
      </section>

      {/* Section 6 */}
      <section className="mb-8 break-before-page">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">6. Qualifications & Certifications</h2>
        <p className="mb-4">
          Track professional qualifications, exam progress, and certifications with detailed status tracking.
        </p>

        <h3 className="text-lg font-semibold mb-2">Qualification Status</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Status</th>
              <th className="border border-gray-300 p-2 text-left">Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Qualified</td>
              <td className="border border-gray-300 p-2">Fully qualified, all exams passed</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Part-Qualified</td>
              <td className="border border-gray-300 p-2">Some exams passed, still studying</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Studying</td>
              <td className="border border-gray-300 p-2">Currently studying, not yet sat exams</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Expired</td>
              <td className="border border-gray-300 p-2">Qualification needs renewal</td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mb-2">Professional Bodies Tracked</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>ACCA (Association of Chartered Certified Accountants)</li>
          <li>ACA/ICAEW (Institute of Chartered Accountants)</li>
          <li>CIMA (Chartered Institute of Management Accountants)</li>
          <li>AAT (Association of Accounting Technicians)</li>
          <li>CFA (Chartered Financial Analyst)</li>
          <li>CIPD (Chartered Institute of Personnel and Development)</li>
          <li>Other professional certifications</li>
        </ul>
      </section>

      {/* Section 7 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">7. Employment History</h2>
        <p className="mb-4">
          The Employment History Card displays a timeline of previous roles with key metrics 
          extracted from CV parsing.
        </p>

        <h3 className="text-lg font-semibold mb-2">Information Displayed</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><strong>Company Name</strong> - Employer name</li>
          <li><strong>Job Title</strong> - Role held</li>
          <li><strong>Date Range</strong> - Start and end dates</li>
          <li><strong>Duration</strong> - Calculated tenure</li>
          <li><strong>Description</strong> - Key responsibilities (if parsed)</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Derived Metrics</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Metric</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Years Experience</td>
              <td className="border border-gray-300 p-2">Total professional experience</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Role Changes (5yr)</td>
              <td className="border border-gray-300 p-2">Number of job moves in past 5 years (job-hopping indicator)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Sector Exposure</td>
              <td className="border border-gray-300 p-2">Industries worked in</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Seniority Level</td>
              <td className="border border-gray-300 p-2">Graduate, Junior, Mid, Senior, Manager, Director, C-Level</td>
            </tr>
          </tbody>
        </table>

        <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
          <p className="font-semibold">Job-Hopping Detection</p>
          <p className="text-sm mt-1">
            Candidates with 4+ role changes in 5 years are flagged. This helps identify 
            potential retention risks before submission.
          </p>
        </div>
      </section>

      {/* Section 8 */}
      <section className="mb-8 break-before-page">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">8. GDPR Compliance</h2>
        <p className="mb-4">
          The GDPR Compliance Card helps you stay compliant with data protection regulations.
        </p>

        <h3 className="text-lg font-semibold mb-2">Consent Tracking</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Field</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Consent Given At</td>
              <td className="border border-gray-300 p-2">Date consent was provided</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Consent Expires At</td>
              <td className="border border-gray-300 p-2">When consent lapses (typically 2 years)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Last Contact Date</td>
              <td className="border border-gray-300 p-2">Most recent interaction with candidate</td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mb-2">GDPR Status Indicators</h3>
        <ul className="space-y-2 mb-4">
          <li><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span><strong>Active</strong> - Valid consent, recently contacted</li>
          <li><span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span><strong>Expiring Soon</strong> - Consent expiring within 30 days</li>
          <li><span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span><strong>Re-consent Required</strong> - No contact in 18+ months</li>
          <li><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span><strong>Expired</strong> - Consent has lapsed</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Available Actions</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Update Last Contact</strong> - Record new interaction date</li>
          <li><strong>Request Re-consent</strong> - Send consent renewal email</li>
          <li><strong>Anonymise Record</strong> - Remove PII while keeping metrics</li>
          <li><strong>Delete Record</strong> - Complete data deletion (right to be forgotten)</li>
        </ul>
      </section>

      {/* Section 9 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">9. Duplicate Detection</h2>
        <p className="mb-4">
          The system automatically detects potential duplicate candidates to maintain data quality.
        </p>

        <h3 className="text-lg font-semibold mb-2">Detection Methods</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Method</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Email Match</td>
              <td className="border border-gray-300 p-2">Exact email address match</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Phone Match</td>
              <td className="border border-gray-300 p-2">Same phone number (normalised)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Name + Email Domain</td>
              <td className="border border-gray-300 p-2">Same name with similar email domain</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">CV Hash</td>
              <td className="border border-gray-300 p-2">Identical CV file content</td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mb-2">Resolution Options</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Merge Records</strong> - Combine into one, keeping most recent data</li>
          <li><strong>Keep Both</strong> - Mark as not duplicates</li>
          <li><strong>Delete Duplicate</strong> - Remove the older/less complete record</li>
        </ul>
      </section>

      {/* Section 10 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">10. AI Profile & CV Scoring</h2>
        <p className="mb-4">
          Each candidate receives an AI-generated profile and quality score to help prioritise outreach.
        </p>

        <h3 className="text-lg font-semibold mb-2">AI Profile Contents</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Key skills extracted from CV</li>
          <li>Experience summary</li>
          <li>Education highlights</li>
          <li>Career achievements</li>
          <li>Ideal role suggestions</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">CV Score Breakdown</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Category</th>
              <th className="border border-gray-300 p-2 text-left">Weight</th>
              <th className="border border-gray-300 p-2 text-left">Factors</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Completeness</td>
              <td className="border border-gray-300 p-2">25%</td>
              <td className="border border-gray-300 p-2">All sections filled, contact info, etc.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Skills Relevance</td>
              <td className="border border-gray-300 p-2">30%</td>
              <td className="border border-gray-300 p-2">In-demand skills, technology stack</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Experience Depth</td>
              <td className="border border-gray-300 p-2">25%</td>
              <td className="border border-gray-300 p-2">Years, progression, achievements</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Presentation</td>
              <td className="border border-gray-300 p-2">20%</td>
              <td className="border border-gray-300 p-2">Formatting, clarity, professionalism</td>
            </tr>
          </tbody>
        </table>
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
              <td className="border border-gray-300 p-2 font-mono text-xs">talent.view</td>
              <td className="border border-gray-300 p-2">View candidate profiles and list</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">talent.manage</td>
              <td className="border border-gray-300 p-2">Edit profiles, update information</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">talent.delete</td>
              <td className="border border-gray-300 p-2">Delete candidate records</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">gdpr.manage</td>
              <td className="border border-gray-300 p-2">Anonymise and manage GDPR compliance</td>
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

CandidateProfileGuide.displayName = 'CandidateProfileGuide';

export default CandidateProfileGuide;
