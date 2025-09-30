import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartModal } from "@/components/inventory/CartModal";
import { ReceiptModal } from "@/components/inventory/ReceiptModal";
import { LengthInputDialog } from "@/components/inventory/LengthInputDialog";
import { InventoryItem, CartItem, Sale } from "@/types/inventory";
import { Plus, Search, Package, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface InventoryPageProps {
  currentUser?: { name: string; role: string };
}

export function InventoryPage({ currentUser = { name: "Default User", role: "user" } }: InventoryPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [isLengthDialogOpen, setIsLengthDialogOpen] = useState(false);
  const [selectedLengthItem, setSelectedLengthItem] = useState<{item: InventoryItem, selectedPrice: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        console.log('Initializing inventory fetch...');
        setIsLoading(true);
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          console.error('Supabase client config:', {
            url: Boolean(supabase.getUrl()),
            hasAuth: Boolean(supabase.auth)
          });
          throw error;
        }

        if (!data) {
          throw new Error('No data received from the server');
        }

        // Transform and validate the data
        const transformedData: InventoryItem[] = data.map(item => ({
          id: item.id,
          name: item.name || '',
          category: item.category || '',
          brand: item.brand || '',
          model: item.model || '',
          minPrice: Number(item.min_price) || 0,
          maxPrice: Number(item.max_price) || 0,
          cost: Number(item.cost) || 0,
          quantity: Number(item.quantity) || 0,
          length: item.length ? Number(item.length) : undefined,
          measureType: item.measure_type === 'length' ? 'length' : 'standard',
          description: item.description || '',
          image: item.image_url,
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.updated_at || new Date().toISOString()
        }));

        console.log('Transformed inventory items:', transformedData); // Debug log
        setInventoryItems(transformedData);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        toast({
          variant: 'destructive',
          title: 'Error loading inventory',
          description: error instanceof Error ? error.message : 'Failed to load inventory items'
        });
        setInventoryItems([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, [toast]);

  const categories = ["all", ...new Set(inventoryItems.map(item => item.category))];

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: InventoryItem, selectedPrice: number) => {
    const existingItem = cartItems.find(cartItem => cartItem.item.id === item.id);
    
    if (item.measureType === 'length') {
      setSelectedLengthItem({ item, selectedPrice });
      setIsLengthDialogOpen(true);
      return;
    }
    
    // Standard items logic
    if (existingItem) {
      if (existingItem.quantity >= item.quantity) {
        toast({
          title: "Insufficient stock",
          description: `Only ${item.quantity} units available`,
          variant: "destructive"
        });
        return;
      }
      updateCartQuantity(item.id, existingItem.quantity + 1);
    } else {
      setCartItems([...cartItems, { item, quantity: 1, selectedPrice }]);
      toast({
        title: "Added to cart",
        description: `${item.name} added to cart`
      });
    }
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) return;

    if (item.measureType === 'length') {
      // Calculate total length used in cart for this item
      const usedLength = cartItems
        .filter(cartItem => cartItem.item.id === itemId && cartItem !== cartItems.find(ci => ci.item.id === itemId))
        .reduce((sum, cartItem) => sum + cartItem.quantity, 0);

      if (quantity + usedLength > (item.length || 0)) {
        toast({
          title: "Insufficient length",
          description: `Only ${(item.length || 0) - usedLength} meters available`,
          variant: "destructive"
        });
        return;
      }
    } else if (quantity > item.quantity) {
      toast({
        title: "Insufficient stock",
        description: `Only ${item.quantity} units available`,
        variant: "destructive"
      });
      return;
    }

    setCartItems(cartItems.map(cartItem =>
      cartItem.item.id === itemId
        ? { ...cartItem, quantity }
        : cartItem
    ));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(cartItem => cartItem.item.id !== itemId));
    toast({
      title: "Removed from cart",
      description: "Item removed from cart"
    });
  };

  const handleCheckout = (customerName: string) => {
    const total = cartItems.reduce((sum, cartItem) => sum + (cartItem.selectedPrice * cartItem.quantity), 0);
    const receiptNumber = `JSS-${Date.now().toString().slice(-6)}`;
    
    const sale: Sale = {
      id: Date.now().toString(),
      items: [...cartItems],
      total,
      customerName,
      soldBy: currentUser.name,
      soldAt: new Date().toISOString(),
      receiptNumber
    };

    setCurrentSale(sale);
    setCartItems([]);
    setIsCartOpen(false);
    setIsReceiptOpen(true);

    toast({
      title: "Sale completed!",
      description: `Receipt #${receiptNumber} generated successfully`
    });
  };

  const getCartItemCount = () => {
    const count = cartItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    return count % 1 === 0 ? count : count.toFixed(2);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Browse and purchase solar equipment</p>
        </div>
        <Button 
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-2"
        >
          <Package className="h-4 w-4" />
          Cart ({getCartItemCount()})
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div>
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-4">
                      <Skeleton className="h-10 flex-1" />
                      <Skeleton className="h-10 flex-1" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="secondary">{item.category}</Badge>
                <Badge 
                  variant={
                    item.measureType === 'length' 
                      ? (item.length && item.length > 0 ? "default" : "destructive")
                      : (item.quantity > 10 ? "default" : item.quantity > 0 ? "secondary" : "destructive")
                  }
                >
                  {item.measureType === 'length' 
                    ? (item.length ? `${(item.length - cartItems
                        .filter(cartItem => cartItem.item.id === item.id)
                        .reduce((sum, cartItem) => sum + cartItem.quantity, 0)
                      ).toFixed(2)}m in stock` : 'Out of stock')
                    : `${item.quantity} in stock`
                  }
                </Badge>
              </div>
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <CardDescription>
                {item.brand} {item.model}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-lg font-semibold text-primary">Price Range:</p>
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => addToCart(item, item.minPrice)}
                      disabled={item.measureType === 'length' ? !item.length || item.length === 0 : item.quantity === 0}
                    >
                      ${item.minPrice.toFixed(2)}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => addToCart(item, item.maxPrice)}
                      disabled={item.measureType === 'length' ? !item.length || item.length === 0 : item.quantity === 0}
                    >
                      ${item.maxPrice.toFixed(2)}
                    </Button>
                  </div>
                </div>
              </div>
              {(item.measureType === 'length' ? !item.length || item.length === 0 : item.quantity === 0) && (
                <Button 
                  disabled
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Out of Stock
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {!isLoading && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
        currentUser={currentUser}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={currentSale}
      />

      {selectedLengthItem && (
        <LengthInputDialog
          isOpen={isLengthDialogOpen}
          onClose={() => {
            setIsLengthDialogOpen(false);
            setSelectedLengthItem(null);
          }}
          onConfirm={(requestedLength) => {
            const item = selectedLengthItem.item;
            const usedLength = cartItems
              .filter(cartItem => cartItem.item.id === item.id)
              .reduce((sum, cartItem) => sum + cartItem.quantity, 0);

            if (requestedLength + usedLength > (item.length || 0)) {
              toast({
                title: "Insufficient length",
                description: `Only ${(item.length || 0) - usedLength} meters available`,
                variant: "destructive"
              });
              return;
            }

            setCartItems([...cartItems, { 
              item, 
              quantity: requestedLength, 
              selectedPrice: selectedLengthItem.selectedPrice 
            }]);
            toast({
              title: "Added to cart",
              description: `${requestedLength} meters of ${item.name} added to cart`
            });
            setIsLengthDialogOpen(false);
            setSelectedLengthItem(null);
          }}
          itemName={selectedLengthItem.item.name}
          availableLength={
            (selectedLengthItem.item.length || 0) -
            cartItems
              .filter(cartItem => cartItem.item.id === selectedLengthItem.item.id)
              .reduce((sum, cartItem) => sum + cartItem.quantity, 0)
          }
        />
      )}
    </div>
  );
}