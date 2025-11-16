
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export const metadata = {
  title: 'My Services | CDM Suite Dashboard',
  description: 'View your purchased services and orders',
};

async function getClientOrders(email: string) {
  const orders = await prisma.order.findMany({
    where: {
      customerEmail: email,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return orders;
}

export default async function MyServicesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login?callbackUrl=/dashboard/my-services');
  }

  const orders = await getClientOrders(user.email);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">My Services</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
          View and manage your purchased services and orders
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
              No Services Yet
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center max-w-md">
              You haven't purchased any services yet. Browse our services and find the perfect solution for your business.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {orders.map((order: any) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg sm:text-xl mb-2 break-words">{order.packageName}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Ordered on {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                    </CardDescription>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                    {getStatusBadge(order.status)}
                    <div className="text-xl sm:text-2xl font-bold text-blue-600 whitespace-nowrap">
                      ${order.packagePrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="min-w-0">
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Order ID</p>
                    <p className="font-mono text-[10px] sm:text-xs truncate">{order.stripeSessionId.substring(0, 24)}...</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Customer</p>
                    <p className="font-medium truncate">{order.customerName || order.customerEmail}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Status</p>
                    <p className="font-medium capitalize truncate">{order.status}</p>
                  </div>
                </div>

                {order.status === 'completed' && (
                  <div className="mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">What's Next?</h4>
                    <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>✓ Our team will reach out to you within 24 hours</li>
                      <li>✓ We'll schedule a kickoff call to discuss your project</li>
                      <li>✓ You'll receive regular updates on progress</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
