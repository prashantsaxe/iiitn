import { NextResponse } from 'next/server';
import { db } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const year = url.searchParams.get('year'); // Get the year from query params

    const query = year ? { 'placement.year': parseInt(year), 'placement.placed': true } : { 'placement.placed': true };

    console.log('Query:', query); // Debugging query

    const placedUsers = await db.collection('users').find(query).toArray();

    console.log('Placed Users:', placedUsers); // Debugging data

    const totalPlaced = placedUsers.length;
    const placementTypes = { intern: 0, fte: 0, both: 0 };
    const companiesSet = new Set<string>();

    placedUsers.forEach((user) => {
      const placement = (user as any).placement;
      if (placement?.type) {
        placementTypes[placement.type as keyof typeof placementTypes]++;
      }
      if (placement?.company) {
        companiesSet.add(placement.company);
      }
    });

    return NextResponse.json({
      totalPlaced,
      totalCompanies: companiesSet.size,
      placementTypes,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error('API Error:', err.message); // Safely access the error message
      return NextResponse.json({ message: 'Server Error', error: err.message }, { status: 500 });
    } else {
      console.error('Unknown Error:', err); // Handle unknown errors
      return NextResponse.json({ message: 'Server Error', error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}