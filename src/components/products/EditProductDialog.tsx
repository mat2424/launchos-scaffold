import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CameraCapture } from './CameraCapture';
import { z } from 'zod';

// Validation schema for product data
const productSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().trim().max(2000, 'Description must be less than 2000 characters'),
  price: z.number().positive('Price must be positive').max(999999, 'Price must be less than $999,999'),
  inventory: z.number().int('Inventory must be a whole number').min(0, 'Inventory cannot be negative').max(999999, 'Inventory too high'),
  tags: z.array(z.string().trim().max(50, 'Tag too long')).max(10, 'Maximum 10 tags allowed'),
  image_urls: z.array(z.string().max(10000, 'Image URL/data too large')).max(5, 'Maximum 5 images allowed')
});

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  inventory: number;
  tags: string[] | null;
  image_urls: string[] | null;
}

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProductDialog = ({ product, open, onOpenChange }: EditProductDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    inventory: '',
    tags: '',
    image_urls: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description || '',
        price: product.price.toString(),
        inventory: product.inventory.toString(),
        tags: product.tags?.join(', ') || '',
        image_urls: product.image_urls?.join(', ') || ''
      });
    }
  }, [product]);

  const updateProduct = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!product) return;
      
      const { error } = await supabase
        .from('products')
        .update({
          title: data.title,
          description: data.description,
          price: parseFloat(data.price),
          inventory: parseInt(data.inventory),
          tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
          image_urls: data.image_urls.split(',').map(u => u.trim()).filter(Boolean)
        })
        .eq('id', product.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: 'Product updated successfully'
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update product',
        variant: 'destructive'
      });
    }
  });

  const deleteProduct = useMutation({
    mutationFn: async () => {
      if (!product) return;
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete product',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data
    const productData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      inventory: parseInt(formData.inventory),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      image_urls: formData.image_urls.split(',').map(u => u.trim()).filter(Boolean)
    };

    // Validate with schema
    try {
      productSchema.parse(productData);
      updateProduct.mutate(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.issues[0].message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: 'Invalid product data',
          variant: 'destructive'
        });
      }
    }
  };

  const handleCameraCapture = async (imageBase64: string) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls ? `${prev.image_urls}, ${imageBase64}` : imageBase64
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Product Name</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-price">Price ($)</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-inventory">Inventory</Label>
              <Input
                id="edit-inventory"
                type="number"
                value={formData.inventory}
                onChange={(e) => setFormData(prev => ({ ...prev, inventory: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-tags">Tags (comma separated)</Label>
            <Input
              id="edit-tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="electronics, gadgets"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="edit-image_urls">Image URLs (comma separated)</Label>
              <CameraCapture onCapture={handleCameraCapture} />
            </div>
            <Textarea
              id="edit-image_urls"
              value={formData.image_urls}
              onChange={(e) => setFormData(prev => ({ ...prev, image_urls: e.target.value }))}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              rows={2}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteProduct.mutate()}
              disabled={deleteProduct.isPending}
            >
              Delete Product
            </Button>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateProduct.isPending}>
                {updateProduct.isPending ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
