import { useState } from "react";
import { CartItem } from "@/types/inventory";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: (customerName: string) => void;
  currentUser: { name: string };
}

export function CartModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  currentUser
}: CartModalProps) {
  const [customerName, setCustomerName] = useState("");
  const { toast } = useToast();

  const total = cartItems.reduce((sum, cartItem) => sum + (cartItem.selectedPrice * cartItem.quantity), 0);

  const handleCheckout = () => {
    if (!customerName.trim()) {
      toast({
        title: "Customer name required",
        description: "Please enter a customer name before checkout.",
        variant: "destructive"
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Add items to cart before checkout.",
        variant: "destructive"
      });
      return;
    }

    onCheckout(customerName);
    setCustomerName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({cartItems.length} items)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cartItems.map((cartItem) => (
                  <div key={cartItem.item.id} className="flex gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{cartItem.item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {cartItem.item.brand} {cartItem.item.model}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {cartItem.item.category}
                      </Badge>
                      <p className="font-semibold mt-2">${cartItem.selectedPrice.toFixed(2)} each</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {cartItem.item.measureType === 'length' ? (
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={cartItem.quantity}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value) && value > 0) {
                              onUpdateQuantity(cartItem.item.id, value);
                            }
                          }}
                          className="w-24"
                        />
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => onUpdateQuantity(cartItem.item.id, Math.max(1, cartItem.quantity - 1))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{cartItem.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => onUpdateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">${(cartItem.selectedPrice * cartItem.quantity).toFixed(2)}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveItem(cartItem.item.id)}
                        className="mt-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="text-right">
                  <p className="text-lg font-semibold">Total: ${total.toFixed(2)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Continue Shopping
                  </Button>
                  <Button onClick={handleCheckout} className="flex-1">
                    Complete Sale
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}