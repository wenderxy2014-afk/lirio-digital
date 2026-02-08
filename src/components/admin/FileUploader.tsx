import { useState, useEffect, useId } from "react";
import { Upload, X, Loader2, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileUploaderProps {
    onUploadComplete: (url: string) => void;
    currentFileUrl?: string;
    bucketName?: string;
    folder?: string;
    maxSizeMB?: number;
    /** Tipos de arquivo aceitos (ex: ".pdf,.doc,.docx") */
    accept?: string;
    /** Label do campo */
    label?: string;
}

export function FileUploader({
    onUploadComplete,
    currentFileUrl,
    bucketName = "home-images",
    folder = "materials",
    maxSizeMB = 10,
    accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg",
    label = "Material para Download",
}: FileUploaderProps) {
    const { toast } = useToast();
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState<string | undefined>(currentFileUrl);
    const [fileName, setFileName] = useState<string>("");

    const uniqueId = useId();
    const inputId = `file-upload-${uniqueId}`;

    useEffect(() => {
        setFileUrl(currentFileUrl);
        if (currentFileUrl) {
            // Extrair nome do arquivo da URL
            const parts = currentFileUrl.split("/");
            const name = parts[parts.length - 1];
            setFileName(decodeURIComponent(name.split("-").slice(2).join("-") || name));
        }
    }, [currentFileUrl]);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file size
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
            toast({
                title: "Arquivo muito grande",
                description: `O arquivo excede ${maxSizeMB}MB`,
                variant: "destructive",
            });
            return;
        }

        setUploading(true);

        try {
            // Gerar nome único para o arquivo
            const ext = file.name.split(".").pop() || "pdf";
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
            const uniqueName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}-${safeName}`;

            // Upload para Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(uniqueName, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            // Obter URL pública
            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(uniqueName);

            setFileUrl(publicUrl);
            setFileName(file.name);
            onUploadComplete(publicUrl);

            toast({
                title: "Sucesso!",
                description: "Arquivo enviado com sucesso",
            });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast({
                title: "Erro no upload",
                description: error.message || "Não foi possível enviar o arquivo",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setFileUrl(undefined);
        setFileName("");
        onUploadComplete("");
    };

    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">{label}</label>

            {fileUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-emerald-50 border-emerald-200">
                    <FileText className="h-8 w-8 text-emerald-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-emerald-800 truncate">{fileName || "Arquivo"}</p>
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                        >
                            <Download className="h-3 w-3" />
                            Visualizar/Baixar
                        </a>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemove}
                            className="text-red-600 hover:bg-red-50 border-red-200"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <label
                    htmlFor={inputId}
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors border-slate-300 hover:border-sky-400"
                >
                    <div className="flex flex-col items-center justify-center py-4">
                        {uploading ? (
                            <>
                                <Loader2 className="h-8 w-8 mb-2 text-muted-foreground animate-spin" />
                                <p className="text-sm text-muted-foreground">Enviando...</p>
                            </>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 mb-2 text-slate-400" />
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-sky-600">Clique para enviar</span> ou arraste
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    PDF, DOC, Imagens (máx. {maxSizeMB}MB)
                                </p>
                            </>
                        )}
                    </div>
                </label>
            )}

            <input
                id={inputId}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
            />
        </div>
    );
}
