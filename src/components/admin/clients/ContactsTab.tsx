/**
 * Contacts Tab Component
 * Displays and manages client contacts/hiring managers
 */
import { useState } from 'react';
import { Plus, User, Mail, Phone, Linkedin, Star, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useClientContacts, useDeleteContact } from '@/hooks/useClients';
import ContactFormDialog from './ContactFormDialog';
import type { ClientContact } from '@/types/client';

interface ContactsTabProps {
  clientId: string;
  canUpdate: boolean;
}

export default function ContactsTab({ clientId, canUpdate }: ContactsTabProps) {
  const { data: contacts, isLoading } = useClientContacts(clientId);
  const deleteContact = useDeleteContact();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<ClientContact | null>(null);
  const [deletingContact, setDeletingContact] = useState<ClientContact | null>(null);

  const handleDelete = async () => {
    if (!deletingContact) return;
    try {
      await deleteContact.mutateAsync({ 
        contactId: deletingContact.id, 
        clientId 
      });
      setDeletingContact(null);
    } catch (error) {
      // Error handled in mutation
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Contacts & Hiring Managers ({contacts?.length || 0})
        </h3>
        {canUpdate && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        )}
      </div>

      {/* Contacts Grid */}
      {!contacts || contacts.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No contacts yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first contact or hiring manager
            </p>
            {canUpdate && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map(contact => (
            <Card 
              key={contact.id} 
              className={`hover:shadow-md transition-shadow ${!contact.is_active ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{contact.name}</span>
                        {contact.is_primary && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      {contact.job_title && (
                        <span className="text-sm text-muted-foreground">{contact.job_title}</span>
                      )}
                    </div>
                  </div>
                  {canUpdate && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingContact(contact)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletingContact(contact)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Contact Details */}
                <div className="space-y-2 text-sm">
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </a>
                  )}
                  {(contact.phone || contact.mobile) && (
                    <a
                      href={`tel:${contact.mobile || contact.phone}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Phone className="w-4 h-4" />
                      {contact.mobile || contact.phone}
                    </a>
                  )}
                  {contact.linkedin_url && (
                    <a
                      href={contact.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  {contact.department && (
                    <Badge variant="outline" className="text-xs">
                      {contact.department}
                    </Badge>
                  )}
                  {contact.is_billing_contact && (
                    <Badge variant="secondary" className="text-xs">
                      Billing
                    </Badge>
                  )}
                  {!contact.is_active && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Inactive
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <ContactFormDialog
        open={showCreateDialog || !!editingContact}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingContact(null);
          }
        }}
        clientId={clientId}
        contact={editingContact}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingContact} onOpenChange={() => setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingContact?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
