'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Package, FileText } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const products = [
    { name: 'Aluminum ACSR Conductor Cable', sku: 'AL-ACSR-240', category: 'Cables', price: 'Rs 88850.00' },
    { name: 'Copper Flexible Wire', sku: 'CU-FLEX-10', category: 'Wires', price: 'Rs 56450.00' },
    { name: 'PVC Insulated Cable', sku: 'PVC-INS-95', category: 'Cables', price: 'Rs 66620.00' },
    { name: 'XLPE Power Cable', sku: 'XLPE-PWR-185', category: 'Cables', price: 'Rs 125320.00' },
    { name: 'Overhead Line Conductor', sku: 'OH-AAC-100', category: 'Conductors', price: 'Rs 38000.00' },
];

export function ProductTestRepository() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-headline">Product & Test Repository</h2>
                <p className="text-muted-foreground">
                    Manage OEM product SKUs and test configurations
                </p>
            </div>

            <Tabs defaultValue="products" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="products" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Products ({products.length})
                        </TabsTrigger>
                        <TabsTrigger value="tests" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Tests (5)
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="products">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle>Product SKUs</CardTitle>
                                <CardDescription>
                                    OEM product specifications and pricing
                                </CardDescription>
                            </div>
                            <Button size="sm" className="gap-1">
                                <Plus className="h-4 w-4" />
                                Add Product
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product.sku}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal">
                                                    {product.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{product.price}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-900/20">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tests">
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Configurations</CardTitle>
                            <CardDescription>
                                Manage standard test procedures and compliance criteria
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                                <FileText className="h-10 w-10 mb-4 opacity-50" />
                                <p>Test repository content would go here.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
