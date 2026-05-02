import { Plus, Edit, Trash2 } from 'lucide-react';
import { CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { AdminCourse } from '../types/admin';

interface CourseManagementPanelProps {
  courses: AdminCourse[];
  onAddCourse: () => void;
  onEditCourse: (course: AdminCourse) => void;
  onDeleteCourse: (course: AdminCourse) => void;
}

export default function CourseManagementPanel({
  courses,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
}: CourseManagementPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <CardTitle>Course Management</CardTitle>
        <Button
          onClick={onAddCourse}
          className="rounded-2xl bg-gradient-to-r from-[#FF8A3D] to-[#FF5F6D] text-white hover:from-[#F17B2D] hover:to-[#F04F60]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="rounded-[26px] border border-[#D8E6F2] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-600">{course.duration}</p>
                <p className="mt-1 text-sm text-gray-500">{course.description}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                    {course.status}
                  </Badge>
                  {course.offlineAvailable && <Badge variant="outline">Offline Available</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onEditCourse(course)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDeleteCourse(course)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && <p className="py-8 text-center text-gray-500">No courses found</p>}
      </div>
    </div>
  );
}
