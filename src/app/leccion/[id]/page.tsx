import { notFound } from 'next/navigation';
import { LessonEngine } from '@/components/LessonEngine';
import { LessonId } from '@/types';

const VALID_IDS: LessonId[] = ['leccion-1', 'leccion-2'];

export function generateStaticParams() {
  return VALID_IDS.map((id) => ({ id }));
}

export default async function LessonPage({
  params,
}: PageProps<'/leccion/[id]'>) {
  const { id } = await params;

  if (!VALID_IDS.includes(id as LessonId)) {
    notFound();
  }

  return <LessonEngine lessonId={id as LessonId} />;
}
