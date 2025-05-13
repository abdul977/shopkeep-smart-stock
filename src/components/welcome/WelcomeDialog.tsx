
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRound, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  whatsapp: z.string().min(10, { message: "Please enter a valid WhatsApp number" }),
});

type WelcomeFormValues = z.infer<typeof formSchema>;

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeDialog({ open, onOpenChange }: WelcomeDialogProps) {
  const form = useForm<WelcomeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      whatsapp: "",
    },
  });

  const onSubmit = (data: WelcomeFormValues) => {
    localStorage.setItem("userInfo", JSON.stringify({
      name: data.name,
      whatsapp: data.whatsapp,
      hasVisited: true
    }));
    
    toast.success("Welcome! Your information has been saved.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-blue-900/80 to-blue-800/60 border border-blue-700/30 backdrop-blur-sm text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">Welcome to ShopKeep!</DialogTitle>
          <DialogDescription className="text-blue-200 text-center">
            Please share your details to enhance your shopping experience
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-100">Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserRound className="absolute left-3 top-3 h-5 w-5 text-blue-300" />
                      <Input 
                        placeholder="Enter your name" 
                        className="pl-10 bg-blue-950/50 border-blue-700/50 text-white placeholder:text-blue-400/70"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-100">WhatsApp Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-3 h-5 w-5 text-blue-300" />
                      <Input 
                        placeholder="Enter your WhatsApp number" 
                        className="pl-10 bg-blue-950/50 border-blue-700/50 text-white placeholder:text-blue-400/70"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Get Started
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
