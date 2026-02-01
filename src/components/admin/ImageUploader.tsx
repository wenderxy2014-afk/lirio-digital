import { useState, useEffect, useId } from "react";
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
  /** Classe Tailwind para controlar o aspecto do preview/dropzone (ex.: "aspect-video", "aspect-[16/5]") */
  aspectClassName?: string;
  /** Largura fixa de saída (ex: 1280 para carrossel) */
  targetWidth?: number;
  /** Altura fixa de saída (ex: 720 para carrossel) */
  targetHeight?: number;
}

export function ImageUploader({
  onUploadComplete,
  currentImageUrl,
  bucketName = "home-images",
  folder = "uploads",
  maxSizeMB = 5,
  aspectClassName = "aspect-video",
  targetWidth,
  targetHeight,
}: ImageUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);

  // Gerar ID único para cada instância do componente
  const uniqueId = useId();
  const inputId = `image-upload-${uniqueId}`;

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
      // Process image: Resize/Crop to target dimensions & convert to WebP
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

            let finalWidth: number;
            let finalHeight: number;
            let sourceX = 0;
            let sourceY = 0;
            let sourceWidth = img.width;
            let sourceHeight = img.height;

            // Se tiver dimensões fixas definidas, fazer crop centralizado
            if (targetWidth && targetHeight) {
              finalWidth = targetWidth;
              finalHeight = targetHeight;

              const targetRatio = targetWidth / targetHeight;
              const imgRatio = img.width / img.height;

              if (imgRatio > targetRatio) {
                // Imagem mais larga - recortar laterais
                sourceHeight = img.height;
                sourceWidth = img.height * targetRatio;
                sourceX = (img.width - sourceWidth) / 2;
              } else {
                // Imagem mais alta - recortar topo/base
                sourceWidth = img.width;
                sourceHeight = img.width / targetRatio;
                sourceY = (img.height - sourceHeight) / 2;
              }
            } else {
              // Sem dimensões fixas - apenas limitar largura máxima
              const MAX_WIDTH = 1920;
              finalWidth = img.width;
              finalHeight = img.height;

              if (finalWidth > MAX_WIDTH) {
                finalHeight *= MAX_WIDTH / finalWidth;
                finalWidth = MAX_WIDTH;
              }
            }

            canvas.width = finalWidth;
            canvas.height = finalHeight;

            // Desenhar imagem com crop (se aplicável)
            ctx.drawImage(
              img,
              sourceX, sourceY, sourceWidth, sourceHeight,  // Área de origem (crop)
              0, 0, finalWidth, finalHeight                  // Área de destino
            );

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
          <div className={`relative ${aspectClassName} overflow-hidden rounded-lg border bg-muted`}>
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
              <label htmlFor={inputId}>
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
          htmlFor={inputId}
          className={`flex flex-col items-center justify-center w-full ${aspectClassName} border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors`}
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
        id={inputId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />
    </div>
  );
}