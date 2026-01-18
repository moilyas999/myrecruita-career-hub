import { forwardRef } from 'react';
import { Separator } from '@/components/ui/separator';

const AutomationUserGuide = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="bg-background text-foreground print:bg-white print:text-black">
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b border-border print:border-black">
        <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4 print:bg-gray-800">
          <span className="text-primary-foreground font-bold text-2xl print:text-white">MR</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">MyRecruita Automation User Guide</h1>
        <p className="text-muted-foreground print:text-gray-600">Version 2.6 | Phase 7: Automation Execution Engine</p>
        <p className="text-sm text-muted-foreground mt-2 print:text-gray-500">
          Last Updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Table of Contents */}
      <section className="mb-8 print:break-after-avoid">
        <h2 className="text-xl font-semibold mb-4 text-primary print:text-gray-800">Table of Contents</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Introduction</li>
          <li>Accessing Automation</li>
          <li>Dashboard Overview</li>
          <li>Creating Automation Rules</li>
          <li>Trigger Types Reference</li>
          <li>Action Types Reference</li>
          <li>Managing Tasks</li>
          <li>Execution History & Monitoring</li>
          <li>Scheduled Automations</li>
          <li>Best Practices</li>
          <li>Example Workflows</li>
          <li>Troubleshooting</li>
          <li>Permissions Reference</li>
        </ol>
      </section>

      <Separator className="my-6 print:border-gray-300" />

      {/* Section 1: Introduction */}
      <section className="mb-8 print:break-before-auto">
        <h2 className="text-xl font-semibold mb-4 text-primary print:text-gray-800">1. Introduction</h2>
        <p className="mb-4">
          The MyRecruita Automation Engine allows you to automate repetitive recruitment workflows, 
          ensuring consistency and saving valuable time. With automation rules, you can trigger 
          actions based on events in the system, such as CV submissions, stage changes, or time-based schedules.
        </p>
        <div className="bg-muted/50 p-4 rounded-lg print:bg-gray-100 print:border print:border-gray-300">
          <h3 className="font-semibold mb-2">Key Benefits</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Reduce manual task creation and follow-ups</li>
            <li>Ensure consistent processes across the team</li>
            <li>Never miss important candidate milestones</li>
            <li>Track automation performance and execution history</li>
            <li>Customisable triggers and actions for your workflow</li>
          </ul>
        </div>
      </section>

      {/* Section 2: Accessing Automation */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary print:text-gray-800">2. Accessing Automation</h2>
        <p className="mb-4">To access the automation features:</p>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Log in to the Admin Dashboard</li>
          <li>Navigate to <strong>Automation</strong> section in the sidebar</li>
          <li>Choose between <strong>Tasks</strong> or <strong>Rules</strong></li>
        </ol>
        <div className="bg-accent/20 p-4 rounded-lg print:bg-gray-50 print:border print:border-gray-300">
          <p className="text-sm">
            <strong>Note:</strong> You need the <code className="bg-muted px-1 rounded print:bg-gray-200">automation.view</code> permission 
            to view automation features and <code className="bg-muted px-1 rounded print:bg-gray-200">automation.manage</code> to 
            create or modify rules.
          </p>
        </div>
      </section>

      {/* Section 3: Dashboard Overview */}
      <section className="mb-8 print:break-before-auto">
        <h2 className="text-xl font-semibold mb-4 text-primary print:text-gray-800">3. Dashboard Overview</h2>
        <p className="mb-4">The Automation Dashboard provides a comprehensive view of your automation system:</p>
        
        <h3 className="font-semibold mb-2">Stats Cards</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-border rounded-lg p-3 print:border-gray-300">
            <p className="text-sm font-medium">Total Tasks</p>
            <p className="text-xs text-muted-foreground print:text-gray-600">All tasks in the system</p>
          </div>
          <div className="border border-border rounded-lg p-3 print:border-gray-300">
            <p className="text-sm font-medium">Pending Tasks</p>
            <p className="text-xs text-muted-foreground print:text-gray-600">Tasks awaiting action</p>
          </div>
          <div className="border border-border rounded-lg p-3 print:border-gray-300">
            <p className="text-sm font-medium">Overdue Tasks</p>
            <p className="text-xs text-muted-foreground print:text-gray-600">Tasks past their due date</p>
          </div>
          <div className="border border-border rounded-lg p-3 print:border-gray-300">
            <p className="text-sm font-medium">Completed (7 Days)</p>
            <p className="text-xs text-muted-foreground print:text-gray-600">Recently completed tasks</p>
          </div>
        </div>

        <h3 className="font-semibold mb-2">My Tasks Section</h3>
        <p className="text-sm mb-2">
          Displays tasks assigned to you, organised by status. Quick filters allow you to focus on 
          pending, in-progress, or overdue items.
        </p>
      </section>

      {/* Section 4: Creating Automation Rules */}
      <section className="mb-8 print:break-before-auto">
        <h2 className="text-xl font-semibold mb-4 text-primary print:text-gray-800">4. Creating Automation Rules</h2>
        <p className="mb-4">Follow these steps to create a new automation rule:</p>
        
        <ol className="list-decimal list-inside space-y-3 mb-6">
          <li>Navigate to <strong>Automation → Rules</strong></li>
          <li>Click the <strong>"Add Rule"</strong> button</li>
          <li>Fill in the rule details in the form dialog</li>
          <li>Configure the trigger conditions</li>
          <li>Set up the action to perform</li>
          <li>Click <strong>"Create Rule"</strong> to save</li>
        </ol>

        <h3 className="font-semibold mb-2">Rule Form Fields</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border print:border-gray-300">
            <thead className="bg-muted print:bg-gray-100">
              <tr>
                <th className="text-left p-2 border-b border-border print:border-gray-300">Field</th>
                <th className="text-left p-2 border-b border-border print:border-gray-300">Description</th>
                <th className="text-left p-2 border-b border-border print:border-gray-300">Required</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-b border-border print:border-gray-300 font-medium">Name</td>
                <td className="p-2 border-b border-border print:border-gray-300">A descriptive name for the rule</td>
                <td className="p-2 border-b border-border print:border-gray-300">Yes</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-border print:border-gray-300 font-medium">Description</td>
                <td className="p-2 border-b border-border print:border-gray-300">Detailed explanation of what the rule does</td>
                <td className="p-2 border-b border-border print:border-gray-300">No</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-border print:border-gray-300 font-medium">Trigger Type</td>
                <td className="p-2 border-b border-border print:border-gray-300">The event that activates this rule</td>
                <td className="p-2 border-b border-border print:border-gray-300">Yes</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-border print:border-gray-300 font-medium">Trigger Config</td>
                <td className="p-2 border-b border-border print:border-gray-300">Specific conditions for the trigger</td>
                <td className="p-2 border-b border-border print:border-gray-300">Varies</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-border print:border-gray-300 font-medium">Action Type</td>
                <td className="p-2 border-b border-border print:border-gray-300">The action to perform when triggered</td>
                <td className="p-2 border-b border-border print:border-gray-300">Yes</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-border print:border-gray-300 font-medium">Action Config</td>
                <td className="p-2 border-b border-border print:border-gray-300">Details of the action (e.g., task title)</td>
                <td className="p-2 border-b border-border print:border-gray-300">Varies</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-border print:border-gray-300 font-medium">Priority</td>
                <td className="p-2 border-b border-border print:border-gray-300">Execution order (higher = first)</td>
                <td className="p-2 border-b border-border print:border-gray-300">No</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Active</td>
                <td className="p-2">Whether the rule is currently enabled</td>
                <td className="p-2">No (default: active)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 5: Trigger Types Reference */}
      <section className="mb-8 print:break-before-auto">
        <h2 className="text-xl font-semibold mb-4 text-primary print:text-gray-800">5. Trigger Types Reference</h2>
        <p className="mb-4">The following triggers are available for automation rules:</p>
        
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-primary print:text-gray-800">CV Submitted</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600 mb-2">
              Fires when a new CV is submitted to the system via any channel.
            </p>
            <p className="text-xs"><strong>Config Options:</strong> Source filter (website, bulk import, manual)</p>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-primary print:text-gray-800">CV Score Above</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600 mb-2">
              Triggers when a CV receives a score above a specified threshold.
            </p>
            <p className="text-xs"><strong>Config Options:</strong> Minimum score (0-100)</p>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-primary print:text-gray-800">Stage Changed</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600 mb-2">
              Activates when a candidate moves to a specific pipeline stage.
            </p>
            <p className="text-xs"><strong>Config Options:</strong> From stage, To stage</p>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-primary print:text-gray-800">Job Created</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600 mb-2">
              Fires when a new job is created in the system.
            </p>
            <p className="text-xs"><strong>Config Options:</strong> Sector filter, Priority filter</p>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-primary print:text-gray-800">Job Ageing</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600 mb-2">
              Triggers when a job has been open for a specified number of days.
            </p>
            <p className="text-xs"><strong>Config Options:</strong> Days threshold</p>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-primary print:text-gray-800">Interview Scheduled</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600 mb-2">
              Activates when an interview is scheduled for a candidate.
            </p>
            <p className="text-xs"><strong>Config Options:</strong> Interview type filter</p>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-primary print:text-gray-800">Placement Made</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600 mb-2">
              Fires when a candidate is successfully placed.
            </p>
            <p className="text-xs"><strong>Config Options:</strong> None</p>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-primary print:text-gray-800">Client Interaction</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600 mb-2">
              Triggers when a client interaction is logged.
            </p>
            <p className="text-xs"><strong>Config Options:</strong> Interaction type filter</p>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-primary print:text-gray-800">Time Based</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600 mb-2">
              Scheduled trigger that runs at specified times (daily, weekly, etc.).
            </p>
            <p className="text-xs"><strong>Config Options:</strong> Cron expression, Timezone</p>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-primary print:text-gray-800">Inactivity</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600 mb-2">
              Fires when there's been no activity on a record for a specified period.
            </p>
            <p className="text-xs"><strong>Config Options:</strong> Days of inactivity, Entity type</p>
          </div>
        </div>
      </section>

      {/* Section 6: Action Types Reference */}
      <section className="mb-8 print:break-before-auto">
        <h2 className="text-xl font-semibold mb-4 text-primary print:text-gray-800">6. Action Types Reference</h2>
        <p className="mb-4">The following actions can be performed by automation rules:</p>
        
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-primary print:text-gray-800">Create Task</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600 mb-2">
              Creates a new task in the task management system.
            </p>
            <p className="text-xs"><strong>Config:</strong> Task title, Description, Priority, Due date offset, Assignee</p>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-primary print:text-gray-800">Send Notification</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600 mb-2">
              Sends a notification to specified users or roles.
            </p>
            <p className="text-xs"><strong>Config:</strong> Recipients, Notification type, Message template</p>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-primary print:text-gray-800">Move Stage</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600 mb-2">
              Automatically moves a candidate to a different pipeline stage.
            </p>
            <p className="text-xs"><strong>Config:</strong> Target stage</p>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-primary print:text-gray-800">Assign User</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600 mb-2">
              Assigns a user to a record (job, candidate, pipeline entry).
            </p>
            <p className="text-xs"><strong>Config:</strong> Assignee (specific user or role-based)</p>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-primary print:text-gray-800">Update Status</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600 mb-2">
              Updates the status of a record.
            </p>
            <p className="text-xs"><strong>Config:</strong> New status value</p>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-primary print:text-gray-800">Add Tag</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600 mb-2">
              Adds a tag or label to a record for categorisation.
            </p>
            <p className="text-xs"><strong>Config:</strong> Tag name</p>
          </div>
        </div>
      </section>

      {/* Section 7: Managing Tasks */}
      <section className="mb-8 print:break-before-auto">
        <h2 className="text-xl font-semibold mb-4 text-primary print:text-gray-800">7. Managing Tasks</h2>
        <p className="mb-4">
          Tasks can be created automatically by rules or manually. The Tasks view provides 
          comprehensive task management capabilities.
        </p>

        <h3 className="font-semibold mb-2">Task Statuses</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="border border-border rounded-lg p-3 print:border-gray-300 bg-yellow-50 dark:bg-yellow-950 print:bg-yellow-50">
            <p className="text-sm font-medium">Pending</p>
            <p className="text-xs text-muted-foreground print:text-gray-600">Awaiting action</p>
          </div>
          <div className="border border-border rounded-lg p-3 print:border-gray-300 bg-blue-50 dark:bg-blue-950 print:bg-blue-50">
            <p className="text-sm font-medium">In Progress</p>
            <p className="text-xs text-muted-foreground print:text-gray-600">Currently being worked on</p>
          </div>
          <div className="border border-border rounded-lg p-3 print:border-gray-300 bg-green-50 dark:bg-green-950 print:bg-green-50">
            <p className="text-sm font-medium">Completed</p>
            <p className="text-xs text-muted-foreground print:text-gray-600">Successfully finished</p>
          </div>
        </div>

        <h3 className="font-semibold mb-2">Task Priorities</h3>
        <ul className="list-disc list-inside space-y-1 text-sm mb-4">
          <li><strong>Critical:</strong> Requires immediate attention</li>
          <li><strong>High:</strong> Important, address soon</li>
          <li><strong>Medium:</strong> Standard priority</li>
          <li><strong>Low:</strong> Can wait if needed</li>
        </ul>

        <h3 className="font-semibold mb-2">Task Types</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Follow Up:</strong> Contact or check in with someone</li>
          <li><strong>Review:</strong> Evaluate a CV, application, or document</li>
          <li><strong>Outreach:</strong> Initial contact or marketing</li>
          <li><strong>Interview Prep:</strong> Prepare for upcoming interview</li>
          <li><strong>Reference Check:</strong> Verify candidate references</li>
          <li><strong>Onboarding:</strong> New hire setup tasks</li>
          <li><strong>Other:</strong> Miscellaneous tasks</li>
        </ul>
      </section>

      {/* Section 8: Execution History */}
      <section className="mb-8 print:break-before-auto">
        <h2 className="text-xl font-semibold mb-4 text-primary print:text-gray-800">8. Execution History & Monitoring</h2>
        <p className="mb-4">
          Track and monitor all automation rule executions to ensure your workflows are running correctly.
        </p>

        <h3 className="font-semibold mb-2">Accessing Execution History</h3>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Navigate to <strong>Automation → Rules</strong></li>
          <li>Click on the <strong>"Execution History"</strong> tab</li>
          <li>View recent executions with status and details</li>
        </ol>

        <h3 className="font-semibold mb-2">Execution Statistics</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-border rounded-lg p-3 print:border-gray-300">
            <p className="text-sm font-medium">Total Executions</p>
            <p className="text-xs text-muted-foreground print:text-gray-600">All-time rule triggers</p>
          </div>
          <div className="border border-border rounded-lg p-3 print:border-gray-300">
            <p className="text-sm font-medium">Success Rate</p>
            <p className="text-xs text-muted-foreground print:text-gray-600">Percentage of successful runs</p>
          </div>
          <div className="border border-border rounded-lg p-3 print:border-gray-300">
            <p className="text-sm font-medium">Failed Count</p>
            <p className="text-xs text-muted-foreground print:text-gray-600">Executions that encountered errors</p>
          </div>
          <div className="border border-border rounded-lg p-3 print:border-gray-300">
            <p className="text-sm font-medium">Avg Execution Time</p>
            <p className="text-xs text-muted-foreground print:text-gray-600">Average processing duration</p>
          </div>
        </div>

        <h3 className="font-semibold mb-2">Execution Details</h3>
        <p className="text-sm mb-2">Click on any execution to view:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Rule name and trigger event</li>
          <li>Execution timestamp</li>
          <li>Status (success/failed)</li>
          <li>Actions executed</li>
          <li>Error messages (if failed)</li>
          <li>Trigger context data</li>
        </ul>
      </section>

      {/* Section 9: Scheduled Automations */}
      <section className="mb-8 print:break-before-auto">
        <h2 className="text-xl font-semibold mb-4 text-primary print:text-gray-800">9. Scheduled Automations</h2>
        <p className="mb-4">
          Some automation rules run on a schedule rather than in response to immediate events. 
          The system automatically processes these via the scheduled automation runner.
        </p>

        <h3 className="font-semibold mb-2">Scheduled Trigger Types</h3>
        <ul className="list-disc list-inside space-y-2 text-sm mb-4">
          <li><strong>Time Based:</strong> Runs at specified intervals (daily, weekly, etc.)</li>
          <li><strong>Inactivity:</strong> Checks for records without recent activity</li>
          <li><strong>Job Ageing:</strong> Monitors jobs that have been open too long</li>
        </ul>

        <div className="bg-muted/50 p-4 rounded-lg print:bg-gray-100 print:border print:border-gray-300">
          <h3 className="font-semibold mb-2">How It Works</h3>
          <p className="text-sm">
            The scheduled automation function runs periodically (typically every hour) and:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm mt-2">
            <li>Retrieves all active scheduled rules</li>
            <li>Evaluates each rule's conditions</li>
            <li>Executes matching rules' actions</li>
            <li>Logs execution results</li>
          </ol>
        </div>
      </section>

      {/* Section 10: Best Practices */}
      <section className="mb-8 print:break-before-auto">
        <h2 className="text-xl font-semibold mb-4 text-primary print:text-gray-800">10. Best Practices</h2>
        
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4 print:border-gray-800">
            <h4 className="font-semibold">Use Descriptive Names</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600">
              Name rules clearly, e.g., "High-Score CV → Create Review Task" instead of "Rule 1"
            </p>
          </div>

          <div className="border-l-4 border-primary pl-4 print:border-gray-800">
            <h4 className="font-semibold">Set Appropriate Priorities</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600">
              Use rule priority to control execution order when multiple rules match the same event
            </p>
          </div>

          <div className="border-l-4 border-primary pl-4 print:border-gray-800">
            <h4 className="font-semibold">Test Before Activating</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600">
              Create rules in inactive state, review the configuration, then activate
            </p>
          </div>

          <div className="border-l-4 border-primary pl-4 print:border-gray-800">
            <h4 className="font-semibold">Avoid Duplicate Actions</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600">
              Review existing rules before creating new ones to prevent overlapping automations
            </p>
          </div>

          <div className="border-l-4 border-primary pl-4 print:border-gray-800">
            <h4 className="font-semibold">Monitor Execution History</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600">
              Regularly check execution logs to identify and fix any failing rules
            </p>
          </div>

          <div className="border-l-4 border-primary pl-4 print:border-gray-800">
            <h4 className="font-semibold">Document with Descriptions</h4>
            <p className="text-sm text-muted-foreground print:text-gray-600">
              Add detailed descriptions to rules explaining their purpose and expected behaviour
            </p>
          </div>
        </div>
      </section>

      {/* Section 11: Example Workflows */}
      <section className="mb-8 print:break-before-auto">
        <h2 className="text-xl font-semibold mb-4 text-primary print:text-gray-800">11. Example Workflows</h2>
        
        <div className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-lg print:bg-gray-50 print:border print:border-gray-300">
            <h3 className="font-semibold mb-2">Example 1: High-Score CV Alert</h3>
            <p className="text-sm mb-3">Automatically create a review task when a high-quality CV is received.</p>
            <div className="text-sm space-y-1">
              <p><strong>Trigger:</strong> CV Score Above</p>
              <p><strong>Condition:</strong> Score ≥ 85</p>
              <p><strong>Action:</strong> Create Task</p>
              <p><strong>Task Config:</strong> Title: "Review high-score CV: [Name]", Priority: High, Due: 1 day</p>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg print:bg-gray-50 print:border print:border-gray-300">
            <h3 className="font-semibold mb-2">Example 2: Interview Prep Reminder</h3>
            <p className="text-sm mb-3">Create a prep task when an interview is scheduled.</p>
            <div className="text-sm space-y-1">
              <p><strong>Trigger:</strong> Interview Scheduled</p>
              <p><strong>Condition:</strong> Any interview type</p>
              <p><strong>Action:</strong> Create Task</p>
              <p><strong>Task Config:</strong> Title: "Prep for [Candidate] interview", Type: Interview Prep, Due: 1 day before</p>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg print:bg-gray-50 print:border print:border-gray-300">
            <h3 className="font-semibold mb-2">Example 3: Stale Job Reminder</h3>
            <p className="text-sm mb-3">Alert when a job has been open without progress.</p>
            <div className="text-sm space-y-1">
              <p><strong>Trigger:</strong> Job Ageing</p>
              <p><strong>Condition:</strong> Days open ≥ 30</p>
              <p><strong>Action:</strong> Send Notification</p>
              <p><strong>Notification:</strong> To assigned recruiter, Message: "Job [Title] has been open for 30+ days"</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 12: Troubleshooting */}
      <section className="mb-8 print:break-before-auto">
        <h2 className="text-xl font-semibold mb-4 text-primary print:text-gray-800">12. Troubleshooting</h2>
        
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-destructive">Rule Not Firing</h4>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              <li>Verify the rule is set to <strong>Active</strong></li>
              <li>Check that trigger conditions match the event</li>
              <li>Confirm you have the required permissions</li>
              <li>Review execution history for any error messages</li>
            </ul>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-destructive">Action Failed</h4>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              <li>Check action configuration for missing required fields</li>
              <li>Verify the target entity exists (e.g., assignee user)</li>
              <li>Review error message in execution history</li>
              <li>Ensure the action type is compatible with the trigger</li>
            </ul>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-destructive">Scheduled Rule Not Running</h4>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              <li>Verify the cron expression is correctly formatted</li>
              <li>Check timezone settings</li>
              <li>Confirm the scheduled automation service is running</li>
              <li>Review system logs for errors</li>
            </ul>
          </div>

          <div className="border border-border rounded-lg p-4 print:border-gray-300">
            <h4 className="font-semibold text-destructive">Duplicate Tasks Being Created</h4>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              <li>Check for multiple rules with similar triggers</li>
              <li>Review rule priorities and conditions</li>
              <li>Consider adding more specific trigger conditions</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 13: Permissions Reference */}
      <section className="mb-8 print:break-before-auto">
        <h2 className="text-xl font-semibold mb-4 text-primary print:text-gray-800">13. Permissions Reference</h2>
        
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border border-border print:border-gray-300">
            <thead className="bg-muted print:bg-gray-100">
              <tr>
                <th className="text-left p-2 border-b border-border print:border-gray-300">Permission</th>
                <th className="text-left p-2 border-b border-border print:border-gray-300">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-b border-border print:border-gray-300 font-mono text-xs">automation.view</td>
                <td className="p-2 border-b border-border print:border-gray-300">View automation dashboard, tasks, and execution history</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">automation.manage</td>
                <td className="p-2">Create, edit, delete, and toggle automation rules</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-semibold mb-2">Role Permissions Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border print:border-gray-300">
            <thead className="bg-muted print:bg-gray-100">
              <tr>
                <th className="text-left p-2 border-b border-border print:border-gray-300">Role</th>
                <th className="text-center p-2 border-b border-border print:border-gray-300">View</th>
                <th className="text-center p-2 border-b border-border print:border-gray-300">Manage Tasks</th>
                <th className="text-center p-2 border-b border-border print:border-gray-300">Manage Rules</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-b border-border print:border-gray-300">Admin</td>
                <td className="p-2 border-b border-border print:border-gray-300 text-center">✓</td>
                <td className="p-2 border-b border-border print:border-gray-300 text-center">✓</td>
                <td className="p-2 border-b border-border print:border-gray-300 text-center">✓</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-border print:border-gray-300">Recruiter</td>
                <td className="p-2 border-b border-border print:border-gray-300 text-center">✓</td>
                <td className="p-2 border-b border-border print:border-gray-300 text-center">✓</td>
                <td className="p-2 border-b border-border print:border-gray-300 text-center">—</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-border print:border-gray-300">Account Manager</td>
                <td className="p-2 border-b border-border print:border-gray-300 text-center">✓</td>
                <td className="p-2 border-b border-border print:border-gray-300 text-center">✓</td>
                <td className="p-2 border-b border-border print:border-gray-300 text-center">—</td>
              </tr>
              <tr>
                <td className="p-2">CV Uploader</td>
                <td className="p-2 text-center">—</td>
                <td className="p-2 text-center">—</td>
                <td className="p-2 text-center">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground print:border-gray-300 print:text-gray-600">
        <p>© {new Date().getFullYear()} MyRecruita. All rights reserved.</p>
        <p className="mt-2">
          For support, contact the system administrator or visit the help center.
        </p>
      </div>
    </div>
  );
});

AutomationUserGuide.displayName = 'AutomationUserGuide';

export default AutomationUserGuide;
