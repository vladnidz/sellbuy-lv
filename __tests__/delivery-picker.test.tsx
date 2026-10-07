import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeliveryPicker, LATVIAN_LOCKERS } from '@/components/delivery-picker';

describe('DeliveryPicker Component', () => {
  it('renders title and default locker options', () => {
    render(<DeliveryPicker />);
    expect(screen.getByText('Omniva / DPD Pakomātu Piegāde')).toBeInTheDocument();
    expect(screen.getByText('Rīgas Akropole Alfa pakomāts')).toBeInTheDocument();
  });

  it('filters lockers by provider tab', () => {
    render(<DeliveryPicker />);
    const dpdButton = screen.getByRole('button', { name: /^DPD \(/i });
    fireEvent.click(dpdButton);

    expect(screen.getByText('DPD Pickup Paku Skapis Rīga Spice')).toBeInTheDocument();
    expect(screen.queryByText('Rīgas Akropole Alfa pakomāts')).not.toBeInTheDocument();
  });

  it('filters lockers by search query input', () => {
    render(<DeliveryPicker />);
    const searchInput = screen.getByPlaceholderText(/Meklēt pēc pilsētas/i);
    fireEvent.change(searchInput, { target: { value: 'Liepāja' } });

    expect(screen.getByText('Liepājas t/c Rietumu Centrs pakomāts')).toBeInTheDocument();
    expect(screen.queryByText('Rīgas Akropole Alfa pakomāts')).not.toBeInTheDocument();
  });

  it('calls onSelect callback when locker is clicked', () => {
    const onSelectMock = jest.fn();
    render(<DeliveryPicker onSelect={onSelectMock} />);

    const lockerOption = screen.getByText('Rīgas Akropole Alfa pakomāts');
    fireEvent.click(lockerOption.closest('button')!);

    expect(onSelectMock).toHaveBeenCalledWith(LATVIAN_LOCKERS[0], 2.99);
  });
});
