import { useState } from "react";
import { useShopkeeper } from "@/contexts/ShopkeeperContext";
import { Shopkeeper } from "@/types/inventory";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Edit, Trash2, UserPlus, Check, X, Link2 } from "lucide-react";
import { PageBackground } from "@/components/ui/global-styles";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Schema for creating a new shopkeeper
const createShopkeeperSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  active: z.boolean().default(true),
});

// Schema for updating an existing shopkeeper
const updateShopkeeperSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  active: z.boolean().default(true),
});

type CreateShopkeeperFormValues = z.infer<typeof createShopkeeperSchema>;
type UpdateShopkeeperFormValues = z.infer<typeof updateShopkeeperSchema>;

const ManageShopkeepers = () => {
  const { shopkeepers, loading, createShopkeeper, updateShopkeeper, deleteShopkeeper } = useShopkeeper();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedShopkeeper, setSelectedShopkeeper] = useState<Shopkeeper | null>(null);

  // Form for creating a new shopkeeper
  const createForm = useForm<CreateShopkeeperFormValues>({
    resolver: zodResolver(createShopkeeperSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      active: true,
    },
  });

  // Form for updating an existing shopkeeper
  const updateForm = useForm<UpdateShopkeeperFormValues>({
    resolver: zodResolver(updateShopkeeperSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      active: true,
    },
  });

  // Handle creating a new shopkeeper
  const onCreateSubmit = async (data: CreateShopkeeperFormValues) => {
    try {
      console.log("Creating shopkeeper with data:", {
        name: data.name,
        email: data.email,
        active: data.active,
        password: "********" // Don't log the actual password
      });

      const result = await createShopkeeper(data);
      if (result) {
        setIsCreateDialogOpen(false);
        createForm.reset();

        // Show success message with login instructions
        toast.success(
          <div>
            <p>Shopkeeper created successfully!</p>
            <p className="text-xs mt-1">Share the login link with them to provide access.</p>
          </div>
        );
      }
    } catch (error) {
      console.error("Error creating shopkeeper:", error);
      toast.error("Failed to create shopkeeper. Please try again.");
    }
  };

  // Handle updating an existing shopkeeper
  const onUpdateSubmit = async (data: UpdateShopkeeperFormValues) => {
    if (!selectedShopkeeper) return;

    try {
      const updateData: Partial<UpdateShopkeeperFormValues> = {
        name: data.name,
        email: data.email,
        active: data.active,
      };

      // Only include password if it's provided
      if (data.password) {
        updateData.password = data.password;
      }

      const result = await updateShopkeeper(selectedShopkeeper.id, updateData);
      if (result) {
        setIsUpdateDialogOpen(false);
        updateForm.reset();
      }
    } catch (error) {
      console.error("Error updating shopkeeper:", error);
    }
  };

  // Handle deleting a shopkeeper
  const handleDelete = async (id: string) => {
    try {
      await deleteShopkeeper(id);
    } catch (error) {
      console.error("Error deleting shopkeeper:", error);
    }
  };

  // Open the update dialog and populate the form with the selected shopkeeper's data
  const handleEditClick = (shopkeeper: Shopkeeper) => {
    setSelectedShopkeeper(shopkeeper);
    updateForm.reset({
      name: shopkeeper.name,
      email: shopkeeper.email,
      password: "",
      active: shopkeeper.active,
    });
    setIsUpdateDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Manage Shopkeepers</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus size={16} />
                <span>Add Shopkeeper</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Shopkeeper</DialogTitle>
                <DialogDescription>
                  Add a new shopkeeper account for your store.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Active</FormLabel>
                          <p className="text-sm text-gray-500">
                            Allow this shopkeeper to access your store
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createForm.formState.isSubmitting}>
                      {createForm.formState.isSubmitting ? "Creating..." : "Create Shopkeeper"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Shopkeeper Access</CardTitle>
            <CardDescription>
              How shopkeepers can access your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-900/20 border border-blue-800/30 rounded-md">
                <h3 className="text-sm font-medium text-blue-200 mb-2">Shopkeeper Login</h3>
                <p className="text-sm text-blue-300/70 mb-3">
                  Shopkeepers can log in at the following URL:
                </p>
                <div className="flex items-center space-x-2">
                  <Input
                    value={`${window.location.origin}/shopkeeper-login`}
                    readOnly
                    className="bg-blue-900/30 border-blue-700/50 text-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const loginUrl = `${window.location.origin}/shopkeeper-login`;
                      navigator.clipboard.writeText(loginUrl);
                      toast.success("Login URL copied to clipboard!");
                    }}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
              <div className="text-sm text-blue-300/70">
                <p>
                  <strong>Note:</strong> Shopkeepers will need their email and password to log in.
                  You can share the login link with them after creating their account.
                </p>
              </div>

              {/* Test account creation button - for development purposes */}
              <div className="mt-4 pt-4 border-t border-blue-800/30">
                <h3 className="text-sm font-medium text-blue-200 mb-2">Quick Test</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      // Create a test shopkeeper account
                      const testData = {
                        name: "Test Shopkeeper",
                        email: "test.shopkeeper@example.com",
                        password: "password123",
                        active: true
                      };

                      await createShopkeeper(testData);

                      toast.success(
                        <div>
                          <p>Test shopkeeper created!</p>
                          <p className="text-xs mt-1">Email: test.shopkeeper@example.com</p>
                          <p className="text-xs">Password: password123</p>
                        </div>
                      );
                    } catch (error) {
                      console.error("Error creating test shopkeeper:", error);
                      toast.error("Failed to create test shopkeeper");
                    }
                  }}
                >
                  Create Test Shopkeeper
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shopkeepers</CardTitle>
            <CardDescription>
              Manage shopkeeper accounts for your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading shopkeepers...</div>
            ) : shopkeepers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No shopkeepers found. Create one to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopkeepers.map((shopkeeper) => (
                    <TableRow key={shopkeeper.id}>
                      <TableCell className="font-medium">{shopkeeper.name}</TableCell>
                      <TableCell>{shopkeeper.email}</TableCell>
                      <TableCell>
                        {shopkeeper.active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check size={12} className="mr-1" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <X size={12} className="mr-1" /> Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(shopkeeper.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(shopkeeper)}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // Copy login link to clipboard
                            const loginUrl = `${window.location.origin}/shopkeeper-login`;
                            navigator.clipboard.writeText(loginUrl);
                            toast.success("Login link copied to clipboard!");
                          }}
                          title="Copy Login Link"
                        >
                          <Link2 size={16} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Delete">
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Shopkeeper</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {shopkeeper.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(shopkeeper.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Update Shopkeeper Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Shopkeeper</DialogTitle>
              <DialogDescription>
                Update the shopkeeper's information.
              </DialogDescription>
            </DialogHeader>
            <Form {...updateForm}>
              <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                <FormField
                  control={updateForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password (Leave blank to keep current)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <p className="text-sm text-gray-500">
                          Allow this shopkeeper to access your store
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={updateForm.formState.isSubmitting}>
                    {updateForm.formState.isSubmitting ? "Updating..." : "Update Shopkeeper"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ManageShopkeepers;
