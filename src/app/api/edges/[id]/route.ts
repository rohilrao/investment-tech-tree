import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// DELETE - Delete an edge
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const edgeId = params.id;

    const client = await clientPromise;
    const db = client.db('tech_tree_db');
    const edgesCollection = db.collection('edges');

    // Check if edge exists
    const existing = await edgesCollection.findOne({ id: edgeId });
    if (!existing) {
      return NextResponse.json(
        { error: 'Edge not found' },
        { status: 404 }
      );
    }

    // Delete the edge
    await edgesCollection.deleteOne({ id: edgeId });

    return NextResponse.json(
      { success: true, message: 'Edge deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting edge:', error);
    return NextResponse.json(
      { error: 'Failed to delete edge' },
      { status: 500 }
    );
  }
}