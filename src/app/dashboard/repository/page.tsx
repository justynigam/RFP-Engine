import { ProductTestRepository } from '@/components/dashboard/product-test-repository';
import Header from '@/components/shared/header';

export default function RepositoryPage() {
    return (
        <>
            <Header />
            <div className="p-4 md:p-8 space-y-8">
                <ProductTestRepository />
            </div>
        </>
    );
}
