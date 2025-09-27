import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X, Loader2, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
    currentAvatar?: string;
    userName: string;
    onAvatarChange: (avatarUrl: string | null) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
    currentAvatar,
    userName,
    onAvatarChange
}) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);
    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Sincronizar com currentAvatar quando mudar
    useEffect(() => {
        if (currentAvatar && currentAvatar !== '') {
            setPreviewUrl(currentAvatar);
            setLocalPreview(null); // Limpar preview local
        } else {
            setPreviewUrl(null);
            setLocalPreview(null);
        }
    }, [currentAvatar]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Arquivo inválido',
                description: 'Por favor, selecione apenas arquivos de imagem.',
                variant: 'destructive',
            });
            return;
        }

        // Validar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'Arquivo muito grande',
                description: 'O arquivo deve ter no máximo 5MB.',
                variant: 'destructive',
            });
            return;
        }

        uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        setUploading(true);

        try {
            // Criar e mostrar preview local imediatamente
            const localPreviewUrl = URL.createObjectURL(file);
            setLocalPreview(localPreviewUrl);
            setPreviewUrl(null); // Esconder avatar anterior

            // Preparar FormData
            const formData = new FormData();
            formData.append('avatar', file);

            // Fazer upload
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/upload/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Aguardar 2 segundos para garantir que o arquivo esteja disponível
                setTimeout(() => {
                    const serverUrl = data.data.avatar_url;

                    // Limpar preview local
                    URL.revokeObjectURL(localPreviewUrl);
                    setLocalPreview(null);

                    // Definir URL do servidor
                    setPreviewUrl(serverUrl);
                    onAvatarChange(serverUrl);

                    toast({
                        title: 'Avatar enviado',
                        description: 'Imagem carregada com sucesso!',
                    });
                }, 2000); // Aumentei para 2 segundos

            } else {
                // Reverter em caso de erro
                URL.revokeObjectURL(localPreviewUrl);
                setLocalPreview(null);
                setPreviewUrl(currentAvatar || null);

                toast({
                    title: 'Erro no upload',
                    description: data.message || 'Não foi possível fazer upload da imagem.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Erro no upload:', error);

            // Limpar preview local em caso de erro
            if (localPreview) {
                URL.revokeObjectURL(localPreview);
                setLocalPreview(null);
            }

            setPreviewUrl(currentAvatar || null);

            toast({
                title: 'Erro de conexão',
                description: 'Não foi possível conectar ao servidor.',
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
            // Limpar input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveAvatar = () => {
        setPreviewUrl(null);
        setLocalPreview(null);
        onAvatarChange(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        toast({
            title: 'Avatar removido',
            description: 'A imagem foi removida.',
        });
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    // Determinar qual imagem mostrar (prioridade: local preview > server preview)
    const displayUrl = localPreview || previewUrl;

    return (
        <div className="space-y-4">
            <Label>Avatar do Usuário</Label>

            <div className="flex items-center space-x-4">
                {/* Preview do Avatar */}
                <div className="relative">
                    <Avatar className="h-20 w-20">
                        {displayUrl ? (
                            <AvatarImage
                                src={localPreview ? displayUrl : `${displayUrl}?v=${Date.now()}`}
                                alt={userName}
                                onError={(e) => {
                                    console.log('Erro ao carregar avatar:', displayUrl);
                                    if (!localPreview) { // Só esconder se não for preview local
                                        e.currentTarget.style.display = 'none';
                                    }
                                }}
                            />
                        ) : null}
                        <AvatarFallback className="text-lg">
                            {userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {/* Loading overlay */}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                        </div>
                    )}
                </div>

                {/* Botões */}
                <div className="flex flex-col space-y-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={openFileDialog}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                            </>
                        ) : (
                            <>
                            <Camera className="mr-2 h-4 w-4" />
                            {displayUrl ? 'Trocar Foto' : 'Adicionar Foto'}
                            </>
                        )}
                    </Button>

                    {displayUrl && !uploading && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveAvatar}
                            className="text-red-600 hover:text-red-700"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Remover
                        </Button>
                    )}
                </div>
            </div>

            {/* Input de arquivo oculto */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Informações */}
            <div className="text-sm text-muted-foreground">
                <p>Formatos aceitos: JPG, PNG, GIF</p>
                <p>Tamanho máximo: 5MB</p>
            </div>
        </div>
    );
};

export default AvatarUpload;