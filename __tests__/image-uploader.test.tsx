import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ImageUploader } from "@/components/image-uploader";

describe("ImageUploader Component", () => {
  const dummyFile1 = new File(["dummy content 1"], "test1.jpg", { type: "image/jpeg" });
  const dummyFile2 = new File(["dummy content 2"], "test2.png", { type: "image/png" });

  it("renders empty uploader dropzone", () => {
    render(<ImageUploader files={[]} onChange={jest.fn()} />);
    expect(
      screen.getByText("Ievelciet attēlus šeit vai spiediet, lai izvēlētos")
    ).toBeInTheDocument();
  });

  it("renders file thumbnails and marks the first as cover", () => {
    render(<ImageUploader files={[dummyFile1, dummyFile2]} onChange={jest.fn()} />);
    
    expect(screen.getByText("Galvenais")).toBeInTheDocument();
    expect(screen.getByText("test1.jpg")).toBeInTheDocument();
    expect(screen.getByText("test2.png")).toBeInTheDocument();
  });

  it("triggers onChange when a file is removed", () => {
    const handleChange = jest.fn();
    render(<ImageUploader files={[dummyFile1, dummyFile2]} onChange={handleChange} />);
    
    const removeButton = screen.getByLabelText("Dzēst attēlu test1.jpg");
    fireEvent.click(removeButton);

    expect(handleChange).toHaveBeenCalledWith([dummyFile2]);
  });

  it("triggers onChange with empty array when 'Dzēst visus' is clicked", () => {
    const handleChange = jest.fn();
    render(<ImageUploader files={[dummyFile1, dummyFile2]} onChange={handleChange} />);
    
    const clearButton = screen.getByText("Dzēst visus (2)");
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it("shows visual feedback when dragging files over dropzone", () => {
    render(<ImageUploader files={[]} onChange={jest.fn()} />);
    const dropzone = screen.getByRole("region", { name: "Attēlu augšupielādes zona" });

    fireEvent.dragOver(dropzone);
    expect(dropzone).toHaveClass("border-indigo-500");
  });

  it("accepts multiple files via file input", () => {
    const handleChange = jest.fn();
    render(<ImageUploader files={[]} onChange={handleChange} />);

    const input = screen.getByTestId("image-uploader-input");
    fireEvent.change(input, { target: { files: [dummyFile1, dummyFile2] } });

    expect(handleChange).toHaveBeenCalledWith([dummyFile1, dummyFile2]);
  });

  it("shows error when max files limit exceeded", () => {
    const handleChange = jest.fn();
    render(<ImageUploader files={[]} onChange={handleChange} maxFiles={1} />);

    const input = screen.getByTestId("image-uploader-input");
    fireEvent.change(input, { target: { files: [dummyFile1, dummyFile2] } });

    expect(screen.getByText(/Maksimālais atļautais attēlu skaits/)).toBeInTheDocument();
  });
});
