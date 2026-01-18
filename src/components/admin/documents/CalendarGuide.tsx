import { forwardRef } from 'react';

const CalendarGuide = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="bg-white text-black p-8 max-w-4xl mx-auto print:p-4">
      {/* Header */}
      <header className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MyRecruita</h1>
            <p className="text-lg text-gray-600">Calendar & Scheduling User Guide</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Version 2.5</p>
            <p>Last Updated: January 2025</p>
          </div>
        </div>
      </header>

      {/* Table of Contents */}
      <nav className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Table of Contents</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Introduction</li>
          <li>Accessing the Calendar</li>
          <li>Calendar Views</li>
          <li>Creating Events</li>
          <li>Event Types</li>
          <li>Event Form Fields</li>
          <li>Editing and Cancelling Events</li>
          <li>Upcoming Events Widget</li>
          <li>Linking Events to Records</li>
          <li>Google Calendar Sync</li>
          <li>Event Reminders</li>
          <li>Best Practices</li>
          <li>Permissions Reference</li>
        </ol>
      </nav>

      {/* Section 1 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">1. Introduction</h2>
        <p className="mb-4">
          The Calendar & Scheduling module helps you manage interviews, client meetings, 
          follow-ups, and reminders all in one place. Link events to candidates, jobs, and 
          clients for complete relationship tracking.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="font-semibold">Key Features:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Calendar views (week/month)</li>
            <li>Multiple event types</li>
            <li>Link to candidates, jobs, clients</li>
            <li>Meeting links and locations</li>
            <li>Reminder notifications</li>
            <li>Google Calendar sync (infrastructure ready)</li>
          </ul>
        </div>
      </section>

      {/* Section 2 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">2. Accessing the Calendar</h2>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Click <strong>Calendar</strong> in the sidebar</li>
          <li>The calendar opens in your default view (week/month)</li>
          <li>Use navigation arrows to move between periods</li>
          <li>Click "Today" to return to current date</li>
        </ol>

        <h3 className="text-lg font-semibold mb-2">Quick Access</h3>
        <p className="text-sm">
          The <strong>Upcoming Events</strong> widget on the dashboard shows your next events 
          without needing to open the full calendar.
        </p>
      </section>

      {/* Section 3 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">3. Calendar Views</h2>
        
        <h3 className="text-lg font-semibold mb-2">Week View</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>7-day view with hourly slots</li>
          <li>Best for detailed scheduling</li>
          <li>See event times and durations</li>
          <li>Drag events to reschedule</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Month View</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Full month overview</li>
          <li>See event density per day</li>
          <li>Click day to see events</li>
          <li>Good for planning ahead</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Colour Coding</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Event Type</th>
              <th className="border border-gray-300 p-2 text-left">Colour</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Interview</td>
              <td className="border border-gray-300 p-2">Blue</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Meeting</td>
              <td className="border border-gray-300 p-2">Green</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Client Call</td>
              <td className="border border-gray-300 p-2">Purple</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Follow-up</td>
              <td className="border border-gray-300 p-2">Orange</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Reminder</td>
              <td className="border border-gray-300 p-2">Yellow</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 4 */}
      <section className="mb-8 break-before-page">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">4. Creating Events</h2>
        
        <h3 className="text-lg font-semibold mb-2">From Calendar</h3>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Click <strong>Add Event</strong> button or click on a time slot</li>
          <li>Fill in event details</li>
          <li>Link to candidate/job/client as needed</li>
          <li>Click <strong>Save</strong></li>
        </ol>

        <h3 className="text-lg font-semibold mb-2">From Pipeline</h3>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>When moving a candidate to an interview stage</li>
          <li>You'll be prompted to schedule the interview</li>
          <li>Event is automatically linked to the candidate and job</li>
        </ol>

        <h3 className="text-lg font-semibold mb-2">From Client Profile</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Click <strong>Schedule Meeting</strong> on client page</li>
          <li>Event is automatically linked to the client</li>
        </ol>
      </section>

      {/* Section 5 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">5. Event Types</h2>
        
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Type</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
              <th className="border border-gray-300 p-2 text-left">Typical Links</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Interview</td>
              <td className="border border-gray-300 p-2">Candidate interview with client</td>
              <td className="border border-gray-300 p-2">Candidate, Job, Client, Pipeline</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Meeting</td>
              <td className="border border-gray-300 p-2">General business meeting</td>
              <td className="border border-gray-300 p-2">Optional</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Client Call</td>
              <td className="border border-gray-300 p-2">Scheduled call with client</td>
              <td className="border border-gray-300 p-2">Client, Contact</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Follow-up</td>
              <td className="border border-gray-300 p-2">Follow-up action needed</td>
              <td className="border border-gray-300 p-2">Candidate or Client</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Reminder</td>
              <td className="border border-gray-300 p-2">Personal reminder</td>
              <td className="border border-gray-300 p-2">Any or none</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 6 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">6. Event Form Fields</h2>
        
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
              <td className="border border-gray-300 p-2 font-medium">Title</td>
              <td className="border border-gray-300 p-2">Yes</td>
              <td className="border border-gray-300 p-2">Event name/subject</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Event Type</td>
              <td className="border border-gray-300 p-2">Yes</td>
              <td className="border border-gray-300 p-2">Category of event</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Start Time</td>
              <td className="border border-gray-300 p-2">Yes</td>
              <td className="border border-gray-300 p-2">When event begins</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">End Time</td>
              <td className="border border-gray-300 p-2">Yes</td>
              <td className="border border-gray-300 p-2">When event ends</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Location</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Physical address</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Meeting Link</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Zoom/Teams/Google Meet URL</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Description</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Agenda/notes</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Assigned To</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Team member responsible</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Candidate</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Link to candidate record</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Job</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Link to job</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Client</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Link to client</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Pipeline</td>
              <td className="border border-gray-300 p-2">No</td>
              <td className="border border-gray-300 p-2">Link to pipeline entry</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 7 */}
      <section className="mb-8 break-before-page">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">7. Editing and Cancelling Events</h2>
        
        <h3 className="text-lg font-semibold mb-2">Editing an Event</h3>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Click on the event in the calendar</li>
          <li>Click <strong>Edit</strong> in the event popover</li>
          <li>Update the fields as needed</li>
          <li>Click <strong>Save Changes</strong></li>
        </ol>

        <h3 className="text-lg font-semibold mb-2">Rescheduling</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Drag and drop to new time slot (week view)</li>
          <li>Or edit and change date/time</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Cancelling an Event</h3>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Click on the event</li>
          <li>Click <strong>Cancel Event</strong></li>
          <li>Provide cancellation reason (optional)</li>
          <li>Confirm cancellation</li>
        </ol>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="font-semibold">⚠️ Note</p>
          <p className="text-sm mt-1">
            Cancelled events are not deleted - they're marked as cancelled and hidden from 
            the default view. This preserves the audit trail.
          </p>
        </div>
      </section>

      {/* Section 8 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">8. Upcoming Events Widget</h2>
        <p className="mb-4">
          The Upcoming Events widget appears on the dashboard and shows:
        </p>

        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Next 5-10 upcoming events</li>
          <li>Event type icon</li>
          <li>Event title</li>
          <li>Date and time</li>
          <li>Quick actions (view, join meeting)</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Today's Events</h3>
        <p className="text-sm">
          Events scheduled for today are highlighted with a "Today" badge.
        </p>
      </section>

      {/* Section 9 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">9. Linking Events to Records</h2>
        <p className="mb-4">
          Link events to candidates, jobs, clients, and pipeline entries for complete tracking:
        </p>

        <h3 className="text-lg font-semibold mb-2">Benefits of Linking</h3>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Events appear on candidate/client timeline</li>
          <li>Quick navigation to related records</li>
          <li>Complete interaction history</li>
          <li>Interview events update pipeline</li>
        </ul>

        <h3 className="text-lg font-semibold mb-2">Viewing Linked Events</h3>
        <p className="text-sm">
          On candidate/client profile pages, a "Scheduled Events" section shows all 
          upcoming and past events linked to that record.
        </p>
      </section>

      {/* Section 10 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">10. Google Calendar Sync</h2>
        <p className="mb-4">
          The calendar infrastructure supports Google Calendar synchronisation:
        </p>

        <h3 className="text-lg font-semibold mb-2">Current Status</h3>
        <div className="bg-gray-50 border-l-4 border-gray-500 p-4 mb-4">
          <p className="font-semibold">Infrastructure Ready</p>
          <p className="text-sm mt-1">
            The calendar_connections table and sync_status field are in place. 
            Google OAuth integration will be configured separately.
          </p>
        </div>

        <h3 className="text-lg font-semibold mb-2">Planned Features</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Two-way sync with Google Calendar</li>
          <li>Auto-create events from interview scheduling</li>
          <li>Calendar availability checking</li>
          <li>Meeting invite sending</li>
        </ul>
      </section>

      {/* Section 11 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">11. Event Reminders</h2>
        <p className="mb-4">
          Automatic reminders help ensure you don't miss important events:
        </p>

        <h3 className="text-lg font-semibold mb-2">Reminder Types</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Reminder</th>
              <th className="border border-gray-300 p-2 text-left">When Sent</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">24-Hour Reminder</td>
              <td className="border border-gray-300 p-2">24 hours before event</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">1-Hour Reminder</td>
              <td className="border border-gray-300 p-2">1 hour before event</td>
            </tr>
          </tbody>
        </table>

        <p className="text-sm">
          Reminders are tracked with reminder_24h_sent and reminder_1h_sent flags to 
          prevent duplicate notifications.
        </p>
      </section>

      {/* Section 12 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">12. Best Practices</h2>
        <div className="space-y-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="font-semibold">✅ Do</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Always link interviews to candidate and job</li>
              <li>Include meeting links for video calls</li>
              <li>Add clear descriptions with agenda</li>
              <li>Update events if times change</li>
              <li>Cancel rather than delete events</li>
            </ul>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="font-semibold">❌ Don't</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Leave events without links to records</li>
              <li>Forget to update event status</li>
              <li>Create duplicate events</li>
              <li>Skip the event type selection</li>
            </ul>
          </div>
        </div>
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
              <td className="border border-gray-300 p-2 font-mono text-xs">calendar.view</td>
              <td className="border border-gray-300 p-2">View calendar and events</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">calendar.manage</td>
              <td className="border border-gray-300 p-2">Create and edit events</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">calendar.delete</td>
              <td className="border border-gray-300 p-2">Delete/cancel events</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-mono text-xs">calendar.all</td>
              <td className="border border-gray-300 p-2">View all team members' calendars</td>
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

CalendarGuide.displayName = 'CalendarGuide';

export default CalendarGuide;
