import React from 'react';
import { render, screen } from '@testing-library/react';
import { VerificationBadge } from '@/components/verification-badge';

describe('VerificationBadge Component', () => {
  it('renders Smart-ID verified badge with default label', () => {
    render(<VerificationBadge type="smart_id" />);
    expect(screen.getByText('Smart-ID Verificēts')).toBeInTheDocument();
  });

  it('renders eParaksts verified badge', () => {
    render(<VerificationBadge type="eparaksts" />);
    expect(screen.getByText('eParaksts Verificēts')).toBeInTheDocument();
  });

  it('renders phone verified badge without label when showLabel is false', () => {
    const { container } = render(<VerificationBadge type="phone" showLabel={false} />);
    expect(screen.queryByText('Tālrunis Apstiprināts')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
