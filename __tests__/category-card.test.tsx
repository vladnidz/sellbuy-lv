/**
 * Unit tests for the CategoryCard component (app/categories/CategoryCard.tsx).
 * Renders name + listing count. framer-motion and next/link are mocked to
 * keep the test focused on markup, not animation internals.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { CategoryCard } from '@/app/categories/CategoryCard';
import type { CategoryWithCounts } from '@/app/categories/page';

jest.mock('framer-motion', () => {
  const passthrough = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props}>{children}</div>
  );
  return {
    motion: new Proxy({}, { get: (_t, key) => passthrough }),
    useReducedMotion: () => false,
  };
});

jest.mock('next/link', () => {
  return ({ href, children, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

function makeCategory(
  overrides: Partial<CategoryWithCounts> = {}
): CategoryWithCounts {
  return {
    id: 'cat-1',
    name: 'Elektronika',
    path: 'elektronika',
    parentId: null,
    _count: { listings: 7 },
    ...overrides,
  };
}

describe('<CategoryCard />', () => {
  it('renders the category name', () => {
    render(<CategoryCard category={makeCategory()} index={0} />);
    expect(screen.getByText('Elektronika')).toBeInTheDocument();
  });

  it('renders the direct listing count', () => {
    render(<CategoryCard category={makeCategory({ _count: { listings: 42 } })} index={0} />);
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('shows 0 when there is no _count data', () => {
    const { _count, ...noCount } = makeCategory();
    render(<CategoryCard category={noCount as CategoryWithCounts} index={0} />);
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  it('sums child counts for parent categories', () => {
    render(
      <CategoryCard
        category={makeCategory({
          _count: { listings: 10 },
          children: [
            makeCategory({ id: 'c2', name: 'Telefoni', _count: { listings: 3 } }),
            makeCategory({ id: 'c3', name: 'Datori', _count: { listings: 4 } }),
          ],
        })}
        index={0}
      />
    );
    // total = 10 + 3 + 4 = 17 (also present in aria-label)
    expect(screen.getByText(/17/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pārlūkot kategoriju Elektronika.*17 sludinājumi/)).toBeInTheDocument();
  });

  it('links to filtered listings for this category', () => {
    render(<CategoryCard category={makeCategory({ id: 'cat-9' })} index={0} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/listings?category=cat-9');
  });
});
