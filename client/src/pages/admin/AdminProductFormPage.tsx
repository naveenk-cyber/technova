import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchApi } from '@/lib/api';
import { ChevronLeft, Plus, Trash2, Save } from 'lucide-react';
import { Button, Input, Skeleton, ErrorState } from '@/components/ui';

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  // Synchronous guard: `saving` state is still false within the same tick, so
  // a double-submit would create two products.
  const savingRef = useRef(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    brand: '',
    price: '',
    discount: '0',
    stock: '',
    categoryId: '',
  });

  const [images, setImages] = useState<string[]>(['']);
  const [specs, setSpecs] = useState<{key: string, value: string}[]>([{ key: '', value: '' }]);

  useEffect(() => {
    const loadCategories = async () => {
      const res = await fetchApi<any>('/categories');
      if (res.data) setCategories(res.data);
    };
    loadCategories();

    if (isEdit) {
      const loadProduct = async () => {
        try {
          const res = await fetchApi<any>(`/products/${id}`);
          if (res.error) throw new Error(res.error);
          if (res.data) {
            const p = res.data;
            setFormData({
              name: p.name,
              slug: p.slug,
              description: p.description,
              brand: p.brand,
              price: p.price.toString(),
              discount: p.discount.toString(),
              stock: p.stock.toString(),
              categoryId: p.categoryId,
            });
            setImages(p.images?.length ? p.images.map((img: any) => img.url) : ['']);
            
            const specEntries = p.specifications ? Object.entries(p.specifications).map(([key, value]) => ({ key, value: value as string })) : [];
            setSpecs(specEntries.length > 0 ? specEntries : [{ key: '', value: '' }]);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to load product');
        } finally {
          setLoading(false);
        }
      };
      loadProduct();
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };
  const addImage = () => setImages([...images, '']);
  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };
  const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingRef.current) return; // Guard against double submits

    savingRef.current = true;
    setSaving(true);
    setError('');

    try {
      const validImages = images.filter(url => url.trim() !== '');
      if (validImages.length === 0) throw new Error("At least one image URL is required");

      const validSpecs = specs.reduce((acc, curr) => {
        if (curr.key.trim() && curr.value.trim()) acc[curr.key.trim()] = curr.value.trim();
        return acc;
      }, {} as Record<string, string>);

      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        description: formData.description,
        brand: formData.brand,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount || '0'),
        stock: parseInt(formData.stock, 10),
        categoryId: formData.categoryId,
        images: validImages,
        specifications: validSpecs
      };

      const res = await fetchApi(isEdit ? `/products/${id}` : '/products', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });

      if (res.error) throw new Error(res.error);
      
      alert(`Product ${isEdit ? 'updated' : 'created'} successfully!`);
      navigate('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
      window.scrollTo(0, 0);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 space-y-4"><Skeleton className="h-8 w-64 mb-8" /><Skeleton className="h-[600px] w-full" /></div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/products" className="p-2 rounded-full hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-foreground">{isEdit ? 'Edit Product' : 'Create New Product'}</h1>
      </div>

      {error && (
        <div className="mb-8">
          <ErrorState message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-sm">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-border pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <Input name="name" value={formData.name} onChange={handleChange} required minLength={3} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug (URL friendly)</label>
              <Input name="slug" value={formData.slug} onChange={handleChange} placeholder="Leave blank to auto-generate" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand *</label>
              <Input name="brand" value={formData.brand} onChange={handleChange} required minLength={2} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select 
                name="categoryId" 
                value={formData.categoryId} 
                onChange={handleChange} 
                required 
                className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              minLength={10}
              className="flex min-h-[120px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-border pb-2">Pricing & Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹) *</label>
              <Input type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount (%)</label>
              <Input type="number" step="0.01" min="0" max="100" name="discount" value={formData.discount} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock *</label>
              <Input type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} required />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h3 className="text-lg font-semibold">Images *</h3>
            <Button type="button" variant="outline" size="sm" onClick={addImage} leftIcon={<Plus className="w-4 h-4 mr-1" />}>Add Image URL</Button>
          </div>
          {images.map((url, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input 
                value={url} 
                onChange={(e) => handleImageChange(idx, e.target.value)} 
                placeholder="https://example.com/image.jpg" 
                required={idx === 0}
              />
              {images.length > 1 && (
                <Button type="button" variant="outline" size="icon" onClick={() => removeImage(idx)} className="text-destructive hover:bg-destructive/10 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Specifications */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h3 className="text-lg font-semibold">Specifications</h3>
            <Button type="button" variant="outline" size="sm" onClick={addSpec} leftIcon={<Plus className="w-4 h-4 mr-1" />}>Add Spec</Button>
          </div>
          {specs.map((spec, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input value={spec.key} onChange={(e) => handleSpecChange(idx, 'key', e.target.value)} placeholder="e.g. Processor" className="flex-1" />
              <Input value={spec.value} onChange={(e) => handleSpecChange(idx, 'value', e.target.value)} placeholder="e.g. Snapdragon 8 Gen 2" className="flex-1" />
              <Button type="button" variant="outline" size="icon" onClick={() => removeSpec(idx)} className="text-destructive hover:bg-destructive/10 shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-border flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/products')}>Cancel</Button>
          <Button type="submit" loading={saving} leftIcon={<Save className="w-4 h-4 mr-2" />}>
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>

      </form>
    </div>
  );
}
