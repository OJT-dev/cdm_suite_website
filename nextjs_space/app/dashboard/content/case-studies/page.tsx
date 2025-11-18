
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  category: string;
  client: string;
  description: string;
  heroImage: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function CaseStudiesManagementPage() {
  const { data: session } = useSession();
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [filteredStudies, setFilteredStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  useEffect(() => {
    filterStudies();
  }, [caseStudies, searchQuery, statusFilter, categoryFilter]);

  const fetchCaseStudies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content/case-studies');
      const data = await response.json();
      
      if (response.ok) {
        setCaseStudies(data.caseStudies);
      } else {
        toast.error('Failed to fetch case studies');
      }
    } catch (error) {
      console.error('Error fetching case studies:', error);
      toast.error('Failed to fetch case studies');
    } finally {
      setLoading(false);
    }
  };

  const filterStudies = () => {
    let filtered = [...caseStudies];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(study =>
        study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(study => study.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(study => study.category === categoryFilter);
    }

    setFilteredStudies(filtered);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/content/case-studies/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Case study deleted successfully');
        fetchCaseStudies();
      } else {
        toast.error('Failed to delete case study');
      }
    } catch (error) {
      console.error('Error deleting case study:', error);
      toast.error('Failed to delete case study');
    } finally {
      setDeleteId(null);
    }
  };

  const categories = Array.from(new Set(caseStudies.map(s => s.category)));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Case Studies
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your case studies and success stories
          </p>
        </div>
        <Link href="/dashboard/content/case-studies/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Case Study
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search case studies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Loading case studies...</p>
          </div>
        ) : filteredStudies.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No case studies found</p>
            <Link href="/dashboard/content/case-studies/new">
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create your first case study
              </Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudies.map((study) => (
                <TableRow key={study.id}>
                  <TableCell>
                    <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100">
                      <Image
                        src={study.heroImage.startsWith('uploads/') ? `/api/file/${encodeURIComponent(study.heroImage)}` : study.heroImage}
                        alt={study.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{study.title}</TableCell>
                  <TableCell>{study.client}</TableCell>
                  <TableCell>{study.category}</TableCell>
                  <TableCell>
                    <Badge variant={study.status === 'published' ? 'default' : 'secondary'}>
                      {study.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(study.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/case-studies/${study.slug}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/content/case-studies/${study.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      {session?.user?.email === 'fray@cdmsuite.com' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(study.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the case study.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
