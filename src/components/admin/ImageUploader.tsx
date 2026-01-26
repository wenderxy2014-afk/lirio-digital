import { useState, useEffect } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  bucketName?: string;
  folder?: string;
  maxSizeMB?: number;
}

export function ImageUploader({
  onUploadComplete,
  currentImageUrl,
  bucketName = "home-images",
  folder = "uploads",
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);

  useEffect(() => {
    setPreviewUrl(currentImageUrl);
  }, [currentImageUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Process image: Resize to max 1920px width & convert to WebP
      const processImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
          const img = document.createElement("img");
          const url = URL.createObjectURL(file);

          img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              reject(new Error("Não foi possível criar contexto de imagem"));
              return;
            }

            const MAX_WIDTH = 1920;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Falha ao converter imagem"));
            }, "image/webp", 0.9);
          };

          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Falha ao carregar imagem"));
          };

          img.src = url;
        });
      };

      const processedBlob = await processImage(file);
      const processedFile = new File([processedBlob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
        type: "image/webp"
      });

      // Validate processed size
      const sizeMB = processedFile.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo otimizado excede ${maxSizeMB}MB`,
          variant: "destructive",
        });
        return;
      }

      // Generate unique filename
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, processedFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/webp"
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);

      toast({
        title: "Sucesso!",
        description: "Imagem otimizada (WebP) e enviada com sucesso",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível enviar a imagem",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(undefined);
    onUploadComplete("");
  };

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative group">
          <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
              <label htmlFor="image-upload">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Alterar
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 mb-4 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground">Enviando imagem...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-10 w-10 mb-4 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Clique para enviar</span> ou arraste
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG ou WEBP (máx. {maxSizeMB}MB)
                </p>
              </>
            )}
          </div>
        </label>
      )}

      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />
    </div>
  );
}