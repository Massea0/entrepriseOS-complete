import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle,
  Download,
  Plus,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ProductImportProps, ProductFormData } from '../ProductCatalog.types';
import { Product } from '@/features/inventory/types/inventory.types';

export const ProductImport: React.FC<ProductImportProps> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [importMode, setImportMode] = useState<'csv' | 'manual'>('csv');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [manualProducts, setManualProducts] = useState<ProductFormData[]>([{
    name: '',
    sku: '',
    category: '',
    description: '',
    unitPrice: 0,
    currency: 'EUR',
    trackingType: 'none',
    minStockLevel: 0,
    maxStockLevel: 0,
    reorderPoint: 0,
    reorderQuantity: 0,
    supplierProducts: []
  }]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const importMutation = useMutation({
    mutationFn: async (products: ProductFormData[]) => {
      // Simulate API call with progress
      const results = { success: 0, failed: 0, errors: [] as string[] };
      
      for (let i = 0; i < products.length; i++) {
        setImportProgress(((i + 1) / products.length) * 100);
        
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Validate product
          if (!products[i].name || !products[i].sku) {
            results.failed++;
            results.errors.push(`Row ${i + 1}: Missing required fields`);
            continue;
          }
          
          // Mock successful import
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Import failed`);
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      setImportResults(results);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      if (results.failed === 0) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setParseError(null);
      
      // Parse CSV file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          // Validate headers
          const requiredHeaders = ['name', 'sku'];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
          
          if (missingHeaders.length > 0) {
            setParseError(`Missing required columns: ${missingHeaders.join(', ')}`);
            return;
          }
          
          // Parse data rows
          const products: ProductFormData[] = [];
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',').map(v => v.trim());
              const product: ProductFormData = {
                name: values[headers.indexOf('name')] || '',
                sku: values[headers.indexOf('sku')] || '',
                category: values[headers.indexOf('category')] || '',
                description: values[headers.indexOf('description')] || '',
                unitPrice: parseFloat(values[headers.indexOf('unitPrice')] || '0'),
                currency: values[headers.indexOf('currency')] || 'EUR',
                trackingType: (values[headers.indexOf('trackingType')] as any) || 'none',
                minStockLevel: parseInt(values[headers.indexOf('minStockLevel')] || '0'),
                maxStockLevel: parseInt(values[headers.indexOf('maxStockLevel')] || '0'),
                reorderPoint: parseInt(values[headers.indexOf('reorderPoint')] || '0'),
                reorderQuantity: parseInt(values[headers.indexOf('reorderQuantity')] || '0'),
                supplierProducts: []
              };
              products.push(product);
            }
          }
          
          setManualProducts(products);
        } catch (error) {
          setParseError('Failed to parse CSV file');
        }
      };
      reader.readAsText(file);
    } else {
      setParseError('Please upload a valid CSV file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const handleAddProduct = () => {
    setManualProducts([...manualProducts, {
      name: '',
      sku: '',
      category: '',
      description: '',
      unitPrice: 0,
      currency: 'EUR',
      trackingType: 'none',
      minStockLevel: 0,
      maxStockLevel: 0,
      reorderPoint: 0,
      reorderQuantity: 0,
      supplierProducts: []
    }]);
  };

  const handleRemoveProduct = (index: number) => {
    setManualProducts(manualProducts.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, field: keyof ProductFormData, value: any) => {
    const updated = [...manualProducts];
    updated[index] = { ...updated[index], [field]: value };
    setManualProducts(updated);
  };

  const handleImport = () => {
    if (importMode === 'csv' && !csvFile) {
      setParseError('Please upload a CSV file first');
      return;
    }
    
    const validProducts = manualProducts.filter(p => p.name && p.sku);
    if (validProducts.length === 0) {
      setParseError('No valid products to import');
      return;
    }
    
    importMutation.mutate(validProducts);
  };

  const downloadTemplate = () => {
    const headers = [
      'name',
      'sku',
      'category',
      'description',
      'unitPrice',
      'currency',
      'trackingType',
      'minStockLevel',
      'maxStockLevel',
      'reorderPoint',
      'reorderQuantity'
    ];
    
    const csvContent = [
      headers.join(','),
      'Example Product,SKU001,Electronics,Sample description,99.99,EUR,serial,10,100,20,30'
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Import Products</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Import Mode Selection */}
        <div className="flex gap-4">
          <Button
            variant={importMode === 'csv' ? 'default' : 'outline'}
            onClick={() => setImportMode('csv')}
            className="flex-1"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV Import
          </Button>
          <Button
            variant={importMode === 'manual' ? 'default' : 'outline'}
            onClick={() => setImportMode('manual')}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Manual Entry
          </Button>
        </div>

        {/* CSV Import */}
        {importMode === 'csv' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors duration-200
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              {csvFile ? (
                <div className="space-y-2">
                  <p className="font-medium">{csvFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {manualProducts.length} products ready to import
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>Drag & drop a CSV file here, or click to select</p>
                  <p className="text-sm text-muted-foreground">
                    Only .csv files are accepted
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Entry */}
        {importMode === 'manual' && (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            <AnimatePresence>
              {manualProducts.map((product, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 border rounded-lg space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Product {index + 1}</h4>
                    {manualProducts.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveProduct(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name *</Label>
                      <Input
                        value={product.name}
                        onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                        placeholder="Product name"
                      />
                    </div>
                    <div>
                      <Label>SKU *</Label>
                      <Input
                        value={product.sku}
                        onChange={(e) => handleProductChange(index, 'sku', e.target.value)}
                        placeholder="SKU"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={product.category}
                        onChange={(e) => handleProductChange(index, 'category', e.target.value)}
                        placeholder="Category"
                      />
                    </div>
                    <div>
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        value={product.unitPrice}
                        onChange={(e) => handleProductChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>Tracking Type</Label>
                      <Select
                        value={product.trackingType}
                        onValueChange={(value) => handleProductChange(index, 'trackingType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="lot">Lot</SelectItem>
                          <SelectItem value="serial">Serial</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Reorder Point</Label>
                      <Input
                        type="number"
                        value={product.reorderPoint}
                        onChange={(e) => handleProductChange(index, 'reorderPoint', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              variant="outline"
              onClick={handleAddProduct}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Product
            </Button>
          </div>
        )}

        {/* Error Alert */}
        {parseError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}

        {/* Import Progress */}
        {importMutation.isPending && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Importing products...</span>
              <span>{Math.round(importProgress)}%</span>
            </div>
            <Progress value={importProgress} />
          </div>
        )}

        {/* Import Results */}
        {importResults && (
          <Alert variant={importResults.failed === 0 ? 'default' : 'destructive'}>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  Import completed: {importResults.success} successful, {importResults.failed} failed
                </p>
                {importResults.errors.length > 0 && (
                  <ul className="list-disc list-inside text-sm">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={importMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={importMutation.isPending || (importMode === 'csv' && !csvFile)}
          >
            <Save className="h-4 w-4 mr-2" />
            Import Products
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};