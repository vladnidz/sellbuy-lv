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

  it("allows moving an image to set it as cover", () => {
    const handleChange = jest.fn();
    render(<ImageUploader files={[dummyFile1, dummyFile2]} onChange={handleChange} />);
    
    const setCoverButton = screen.getByTitle("Padarīt par galveno");
    fireEvent.click(setCoverButton);

    expect(handleChange).toHaveBeenCalledWith([dummyFile2, dummyFile1]);
  });

  it("displays validation error when adding unsupported file type", () => {
    const handleError = jest.fn();
    const handleChange = jest.fn();
    render(
      <ImageUploader
        files={[]}
        onChange={handleChange}
        onError={handleError}
        allowedTypes={["image/jpeg"]}
      />
    );

    const input = screen.getByTestId("image-uploader-input");
    const pdfFile = new File(["pdf"], "doc.pdf", { type: "application/pdf" });
    
    fireEvent.change(input, { target: { files: [pdfFile] } });

    expect(handleError).toHaveBeenCalledWith('Fails "doc.pdf" nav atbalstītā formātā (JPG, PNG, WEBP, GIF, AVIF)');
    expect(handleChange).not.toHaveBeenCalled();
  });
});
