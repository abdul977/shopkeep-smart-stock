import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableFooter,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner";
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
} from "@/components/ui/alert-dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  PageBackground,
  GlowCircle
} from "@/components/ui/global-styles";

const shopkeeperSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  active: z.boolean().default(true).optional(),
});

type ShopkeeperFormValues = z.infer<typeof shopkeeperSchema>;

const ManageShopkeepers = () => {
  const { shopkeeperUser, isShopkeeper, shopkeepers, createShopkeeper, updateShopkeeper, deleteShopkeeper } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shopkeeperToDelete, setShopkeeperToDelete] = useState<string | null>(null);
  const [deleteAlertDialogOpen, setDeleteAlertDialogOpen] = useState(false);

  useEffect(() => {
    if (!isShopkeeper || !shopkeeperUser) {
      navigate("/shopkeeper-login");
    }
  }, [isShopkeeper, shopkeeperUser, navigate]);

  const form = useForm<ShopkeeperFormValues>({
    resolver: zodResolver(shopkeeperSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      active: true,
    },
  });

  const addShopkeeper = async (data: ShopkeeperFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Ensure all required fields are provided
      await createShopkeeper({
        name: data.name, // This is required
        email: data.email, // This is required
        active: data.active !== undefined ? data.active : true, // Provide default if undefined
        password: data.password // This is required
      });

      toast.success("Shopkeeper added successfully!");
      form.reset();
      setOpen(false);
    } catch (error: any) {
      console.error("Error adding shopkeeper:", error);
      toast.error(`Failed to add shopkeeper: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShopkeeperDelete = async () => {
    if (shopkeeperToDelete) {
      try {
        await deleteShopkeeper(shopkeeperToDelete);
        toast.success("Shopkeeper deleted successfully!");
      } catch (error: any) {
        console.error("Error deleting shopkeeper:", error);
        toast.error(`Failed to delete shopkeeper: ${error.message}`);
      } finally {
        setShopkeeperToDelete(null);
        setDeleteAlertDialogOpen(false);
      }
    }
  };

  const handleOpenDeleteDialog = (shopkeeperId: string) => {
    setShopkeeperToDelete(shopkeeperId);
    setDeleteAlertDialogOpen(true);
  };

  return (
    <PageBackground darkMode className="flex items-center justify-center min-h-screen px-4 py-8">
      {/* Background effects */}
      <GlowCircle className="w-[300px] h-[300px] bg-blue-600/20 top-0 right-0" />
      <GlowCircle className="w-[200px] h-[200px] bg-blue-800/20 bottom-20 left-10" />

      <div className="container relative z-10">
        <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-6 rounded-xl border border-blue-700/30 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-200">Manage Shopkeepers</CardTitle>
            <CardDescription className="text-blue-300">Add, edit, and manage shopkeeper accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Add Shopkeeper</Button>
                </DialogTrigger>
                <DialogContent className="bg-gradient-to-br from-blue-900/80 to-blue-800/70 border border-blue-700/50 text-white">
                  <DialogHeader>
                    <DialogTitle>Add Shopkeeper</DialogTitle>
                    <DialogDescription>
                      Create a new shopkeeper account.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(addShopkeeper)} className="space-y-4">
                      <FormField
                        control={form.control}
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
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="johndoe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">Active</FormLabel>
                              <FormDescription>
                                Set shopkeeper account active status.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end">
                        <DialogClose asChild>
                          <Button type="button" variant="secondary">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableCaption>A list of your shopkeepers.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopkeepers?.map((shopkeeper) => (
                    <TableRow key={shopkeeper.id}>
                      <TableCell className="font-medium">{shopkeeper.name}</TableCell>
                      <TableCell>{shopkeeper.email}</TableCell>
                      <TableCell>{shopkeeper.active ? "Active" : "Inactive"}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => handleOpenDeleteDialog(shopkeeper.id)}>Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gradient-to-br from-blue-900/80 to-blue-800/70 border border-blue-700/50 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the shopkeeper
                                account and remove all of its data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleShopkeeperDelete}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageBackground>
  );
};

export default ManageShopkeepers;

// Helper component
const FormDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
  )
}
