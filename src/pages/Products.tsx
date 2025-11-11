import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Eye, DollarSign, Package, Loader2 } from "lucide-react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CameraCapture } from "@/components/products/CameraCapture";
import { EditProductDialog } from "@/components/products/EditProductDialog";

// Validation schema for product data
const productSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().trim().max(2000, 'Description must be less than 2000 characters').optional(),
  price: z.number().positive('Price must be positive').max(999999, 'Price must be less than $999,999'),
  inventory: z.number().int('Inventory must be a whole number').min(0, 'Inventory cannot be negative').max(999999, 'Inventory too high'),
  tags: z.array(z.string().trim().max(50, 'Tag too long')).max(10, 'Maximum 10 tags allowed'),
  image_urls: z.array(z.string().max(10000, 'Image URL/data too large')).max(5, 'Maximum 5 images allowed')
});

export default function Products() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    inventory: '',
    image_urls: '',
    tags: ''
  });
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: analytics } = useQuery({
    queryKey: ['product-analytics'],
    queryFn: async () => {
      const { data: products } = await supabase.from('products').select('views, sales');
      if (!products) return { totalViews: 0, totalSales: 0, conversionRate: 0 };
      
      const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalSales = products.reduce((sum, p) => sum + (p.sales || 0), 0);
      const conversionRate = totalViews > 0 ? ((totalSales / totalViews) * 100).toFixed(1) : '0.0';
      
      return { totalViews, totalSales, conversionRate };
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['product-analytics'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createProduct = useMutation({
    mutationFn: async (newProduct: any) => {
      const { data, error } = await supabase.from('products').insert([newProduct]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Product created successfully');
      setIsDialogOpen(false);
      setFormData({ title: '', description: '', price: '', inventory: '', image_urls: '', tags: '' });
      setIsAnalyzing(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create product');
      setIsAnalyzing(false);
    }
  });

  const handleCameraCapture = async (imageBase64: string) => {
    setIsAnalyzing(true);
    toast.info("Analyzing product with AI...");

    try {
      const { data, error } = await supabase.functions.invoke('analyze-product', {
        body: { imageBase64 }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Update form with AI-generated data
      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        price: data.price?.toString() || prev.price,
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : prev.tags,
        image_urls: imageBase64
      }));

      toast.success("Product analyzed successfully!");
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze product");
      // Still set the image even if analysis fails
      setFormData(prev => ({
        ...prev,
        image_urls: imageBase64
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.price) {
      toast.error('Please fill in required fields');
      return;
    }

    // Prepare data
    const productData = {
      title: formData.title,
      description: formData.description || '',
      price: parseFloat(formData.price),
      inventory: parseInt(formData.inventory) || 0,
      image_urls: formData.image_urls.split(',').map(url => url.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    // Validate with schema
    try {
      productSchema.parse(productData);
      createProduct.mutate(productData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      } else {
        toast.error('Invalid product data');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your catalog or use camera to scan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title" 
                  placeholder="Product name"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Product description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventory">Inventory</Label>
                  <Input 
                    id="inventory" 
                    type="number"
                    placeholder="0"
                    value={formData.inventory}
                    onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input 
                  id="tags" 
                  placeholder="electronics, gadgets"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="image_urls">Image URLs (comma separated)</Label>
                  <CameraCapture 
                    onCapture={handleCameraCapture}
                    onAnalyzing={setIsAnalyzing}
                  />
                </div>
                <Textarea 
                  id="image_urls" 
                  placeholder="https://example.com/image.jpg or data:image/jpeg;base64,..."
                  value={formData.image_urls}
                  onChange={(e) => setFormData({ ...formData, image_urls: e.target.value })}
                  rows={2}
                />
              </div>
              <Button 
                onClick={handleSubmit} 
                className="w-full" 
                disabled={createProduct.isPending || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : createProduct.isPending ? (
                  "Creating..."
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalViews || 0}</div>
            <p className="text-xs text-muted-foreground">Across all products</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalSales || 0}</div>
            <p className="text-xs text-muted-foreground">Total units sold</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.conversionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Views to sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!products || products.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No products yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first product to get started</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          products.map((product: any) => (
            <Card 
              key={product.id} 
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleProductClick(product)}
            >
              {product.image_urls && product.image_urls.length > 0 ? (
                <div className="h-48 w-full overflow-hidden bg-muted">
                  <img 
                    src={product.image_urls[0]} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center bg-accent text-6xl">
                  📦
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{product.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{product.description || 'No description'}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">${Number(product.price).toFixed(2)}</span>
                    <Badge variant="outline">Stock: {product.inventory || 0}</Badge>
                  </div>
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {product.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{product.views || 0} views</span>
                    <span>{product.sales || 0} sales</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <EditProductDialog
        product={selectedProduct}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}
