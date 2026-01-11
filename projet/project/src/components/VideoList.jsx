import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Player from "@vimeo/player";
import Carousel from "./Carrousel.jsx";

// Dimensions de référence (comme Figma)
const BASE_WIDTH_MOBILE = 390;
const BASE_WIDTH_DESKTOP = 1440;

// Valeurs de référence en px (basées sur le design Figma)
const REFERENCE_VALUES = {
  mobile: {
    navbarSpacing: 0, // Fixe - Réduit pour mobile (était 41)
    videoSpacing: 80, // Fixe
    horizontalMargin: 15, // Fixe
    bottomMargin: 18 // Marge en bas fixe
  },
  desktop: {
    navbarSpacing: 17, // Fixe
    videoSpacing: 25, // Fixe (espacement après la vidéo)
    horizontalMargin: 46, // Fixe
    videoHeight: 392, // Proportionnel - Hauteur du lecteur vidéo
    bottomMargin: 28 // Marge en bas fixe
  }
};

export default function VideoList() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // État pour la barre de progression
  const [isFullscreen, setIsFullscreen] = useState(false); // État pour détecter le plein écran
  const [showControls, setShowControls] = useState(false); // État pour afficher/masquer les contrôles au clic
  const [isHovering, setIsHovering] = useState(false); // État pour détecter le hover
  const [isMuted, setIsMuted] = useState(false); // État pour le son
  const [fullscreenVideoDimensions, setFullscreenVideoDimensions] = useState({ width: '100vw', height: '100vh' }); // Dimensions pour letterboxing en plein écran
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const videoContainerRef = useRef(null); // Référence pour le conteneur vidéo
  const controlsTimeoutRef = useRef(null); // Référence pour le timeout de masquage des contrôles

  // État pour les dimensions (marges fixes, vidéo proportionnelle)
  const [spacing, setSpacing] = useState({
    navbarSpacing: 41,
    videoSpacing: 80,
    carouselSpacing: 80,
    horizontalMargin: 15,
    videoHeight: 210, // Hauteur de la vidéo (proportionnelle)
    bottomMargin: 18, // Marge en bas (fixe)
    isMobile: false // État pour savoir si on est en mobile
  });

  // Calcul des dimensions proportionnelles basées sur la largeur réelle du conteneur
  useEffect(() => {
    const calculateSpacing = () => {
      // Utiliser document.documentElement.clientWidth pour une mesure plus fiable
      const screenWidth = document.documentElement.clientWidth || window.innerWidth;
      const screenHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth;
      const containerWidth = containerRef.current ? containerRef.current.getBoundingClientRect().width : null;

      const isMobile = screenWidth <= 820; // Même breakpoint que le carrousel

      const baseWidth = isMobile ? BASE_WIDTH_MOBILE : BASE_WIDTH_DESKTOP;
      const scaleRatio = screenWidth / baseWidth;
      const refValues = isMobile ? REFERENCE_VALUES.mobile : REFERENCE_VALUES.desktop;

      // Calculer la hauteur de la vidéo de manière progressive
      // Sur les très grands écrans, augmenter progressivement
      let videoHeight;
      let carouselSpacing;

      if (isMobile) {
        // Augmenter la hauteur de la vidéo en mobile pour qu'elle soit plus grande
        videoHeight = 220 * scaleRatio; // Augmenté de 154 à 180
        carouselSpacing = refValues.videoSpacing; // Fixe pour mobile
      } else {
        // Pour desktop : fixer les marges et adapter la vidéo pour remplir l'espace sans espace blanc
        const navbarHeight = 12 + 60; // margin-top + hauteur navbar approximative
        const carouselWithTitle = 250; // Hauteur approximative du carrousel avec titres (image + titre)
        const bottomMarginFixed = refValues.bottomMargin; // Marge en bas fixe (28px)
        const baseCarouselSpacing = refValues.videoSpacing; // Espacement fixe entre vidéo et carrousel (25px)

        // Calculer l'espace disponible pour la vidéo
        // Hauteur totale utilisée = navbar + navbarSpacing + carouselSpacing + carousel + bottomMargin
        const fixedHeight = navbarHeight + refValues.navbarSpacing + baseCarouselSpacing + carouselWithTitle + bottomMarginFixed;
        const availableHeightForVideo = screenHeight - fixedHeight;

        // La vidéo doit remplir exactement l'espace disponible pour éviter tout espace blanc
        // Utiliser au minimum la hauteur de référence, sinon remplir tout l'espace disponible
        const minVideoHeight = refValues.videoHeight;
        videoHeight = Math.max(availableHeightForVideo, minVideoHeight);

        // Si l'espace disponible est supérieur à la hauteur minimale, utiliser tout l'espace
        // pour éviter l'espace blanc en dessous du carrousel
        if (availableHeightForVideo > minVideoHeight) {
          videoHeight = availableHeightForVideo;
        }

        // L'espacement entre vidéo et carrousel reste fixe (25px)
        carouselSpacing = baseCarouselSpacing;
      }

      const bottomMarginFixed = refValues.bottomMargin || (isMobile ? 18 : 28); // Marge en bas fixe

      const newSpacing = {
        navbarSpacing: refValues.navbarSpacing, // Fixe - ne change pas avec l'écran
        videoSpacing: refValues.videoSpacing, // Fixe - ne change pas avec l'écran
        carouselSpacing: carouselSpacing, // Fixe pour desktop, variable pour mobile
        horizontalMargin: refValues.horizontalMargin, // Fixe - ne change pas avec l'écran
        videoHeight: videoHeight, // Adaptatif pour remplir l'espace disponible
        bottomMargin: bottomMarginFixed, // Fixe - marge en bas constante (18px mobile, 28px desktop)
        isMobile: isMobile // État mobile pour le rendu
      };

      // Logs de débogage
      console.log('=== VideoList Spacing Calculation ===');
      console.log('screenWidth (clientWidth):', screenWidth);
      console.log('window.innerWidth:', windowWidth);
      console.log('containerRef width:', containerWidth);
      console.log('isMobile:', isMobile);
      console.log('baseWidth:', baseWidth);
      console.log('scaleRatio:', scaleRatio);
      console.log('refValues:', refValues);
      console.log('newSpacing:', newSpacing);
      console.log('Détails newSpacing:', {
        navbarSpacing: `${newSpacing.navbarSpacing.toFixed(2)}px`,
        videoSpacing: `${newSpacing.videoSpacing.toFixed(2)}px`,
        horizontalMargin: `${newSpacing.horizontalMargin.toFixed(2)}px`,
        videoHeight: `${newSpacing.videoHeight.toFixed(2)}px`
      });
      console.log('===================================');

      setSpacing(newSpacing);
    };

    // Calculer immédiatement et après le montage
    calculateSpacing();

    // Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
    const rafId = requestAnimationFrame(() => {
      calculateSpacing();
    });

    window.addEventListener('resize', calculateSpacing);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', calculateSpacing);
    };
  }, []);

  // Fetch videos from the server
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/videos.json");
        if (!response.ok) throw new Error("Failed to fetch videos.");
        const data = await response.json();

        const processedData = data.map((video) => {
          let videoUrl = video.url || video.video;
          if (videoUrl?.includes("vimeo.com/") && !videoUrl.includes("player.vimeo.com")) {
            const videoId = videoUrl.split("vimeo.com/")[1];
            videoUrl = `https://player.vimeo.com/video/${videoId}`;
          }
          return { ...video, url: videoUrl };
        });

        setVideos(processedData);
        setSelectedVideo(processedData[0]);
      } catch (err) {
        console.error("Error loading videos:", err);
        setError(err.message);
      }
    };

    fetchVideos();
  }, []);

  // Initialize Vimeo Player when video changes
  useEffect(() => {
    if (videoRef.current && selectedVideo) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (err) {
          console.error("Error destroying player:", err);
        }
      }

      setTimeout(async () => {
        if (videoRef.current) {
          playerRef.current = new Player(videoRef.current);
          setIsPlaying(false);

          // Listen to timeupdate events for progress
          playerRef.current.on("timeupdate", async (data) => {
            try {
              const duration = await playerRef.current.getDuration();
              if (duration && duration > 0) {
                setProgress((data.seconds / duration) * 100);
              }
            } catch (err) {
              console.error("Error updating progress:", err);
            }
          });

          // Listen to play/pause events
          playerRef.current.on("play", () => {
            setIsPlaying(true);
            // Masquer les contrôles après 3 secondes seulement si on ne survole pas
            if (controlsTimeoutRef.current) {
              clearTimeout(controlsTimeoutRef.current);
            }
            if (!isHovering) {
              controlsTimeoutRef.current = setTimeout(() => {
                if (!isHovering) {
                  setShowControls(false);
                }
              }, 3000);
            }
          });
          playerRef.current.on("pause", () => {
            setIsPlaying(false);
            // Garder les contrôles visibles quand on pause
            setShowControls(true);
          });
          playerRef.current.on("ended", () => {
            setIsPlaying(false); // Réafficher le bouton play quand la vidéo est finie
            setShowControls(true); // Afficher les contrôles à la fin
          });

          // Vérifier l'état initial du volume
          try {
            const volume = await playerRef.current.getVolume();
            setIsMuted(volume === 0);
          } catch (err) {
            console.error("Error getting volume:", err);
          }
        }
      }, 100);
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (err) {
          console.error("Error in cleanup:", err);
        }
        playerRef.current = null;
      }
    };
  }, [selectedVideo]);

  const handlePlayPause = async () => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        await playerRef.current.pause();
      } else {
        await playerRef.current.play();
      }
    } catch (err) {
      console.error("Error controlling video:", err);
    }
  };

  const handleFullscreen = async () => {
    const container = videoContainerRef.current;
    if (!container) return;

    try {
      if (isFullscreen) {
        // Sortir du plein écran
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        setIsFullscreen(false);
      } else {
        // Entrer en plein écran sur notre conteneur (pas via Vimeo)
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          await container.webkitRequestFullscreen();
        } else if (container.mozRequestFullScreen) {
          await container.mozRequestFullScreen();
        } else if (container.msRequestFullscreen) {
          await container.msRequestFullscreen();
        }
        setIsFullscreen(true);
        // Calculer les dimensions pour letterboxing
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const aspectRatio = 16 / 9;
        
        let iframeWidth, iframeHeight;
        
        // Si l'écran est plus large que le ratio 16:9, on limite par la hauteur
        if (screenWidth / screenHeight > aspectRatio) {
          iframeHeight = screenHeight;
          iframeWidth = screenHeight * aspectRatio;
        } else {
          // Sinon, on limite par la largeur
          iframeWidth = screenWidth;
          iframeHeight = screenWidth / aspectRatio;
        }
        
        setFullscreenVideoDimensions({
          width: `${iframeWidth}px`,
          height: `${iframeHeight}px`
        });
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  };

  // Écouter les changements de plein écran et gérer les événements en mode plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      const isCurrentlyFullscreen = !!fullscreenElement;

      // Vérifier que c'est bien notre conteneur vidéo qui est en plein écran
      const isOurContainer = fullscreenElement === videoContainerRef.current;

      setIsFullscreen(isCurrentlyFullscreen && isOurContainer);
      // Forcer l'affichage des contrôles quand on entre/sort du plein écran
      if (isCurrentlyFullscreen && isOurContainer) {
        setShowControls(true);
        setIsHovering(true);
        // Calculer les dimensions pour letterboxing
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const aspectRatio = 16 / 9;
        
        let iframeWidth, iframeHeight;
        
        // Si l'écran est plus large que le ratio 16:9, on limite par la hauteur
        if (screenWidth / screenHeight > aspectRatio) {
          iframeHeight = screenHeight;
          iframeWidth = screenHeight * aspectRatio;
        } else {
          // Sinon, on limite par la largeur
          iframeWidth = screenWidth;
          iframeHeight = screenWidth / aspectRatio;
        }
        
        setFullscreenVideoDimensions({
          width: `${iframeWidth}px`,
          height: `${iframeHeight}px`
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Gérer les événements en mode plein écran (clic et mouvement de souris)
  useEffect(() => {
    if (!isFullscreen) return;

    // Gérer les clics sur le document en mode plein écran
    const handleFullscreenClick = async (e) => {
      // Ignorer les clics sur la navbar, les boutons play/pause, et leurs parents
      const navbar = document.querySelector('[data-fullscreen-navbar]');
      const playButton = e.target.closest('button[data-fullscreen-play]');
      const pauseButton = e.target.closest('button[data-fullscreen-pause]');

      if ((navbar && navbar.contains(e.target)) || playButton || pauseButton) {
        return;
      }

      // Ignorer les clics sur les images (boutons play/pause)
      if (e.target.tagName === 'IMG' && (e.target.alt === 'Play' || e.target.alt === 'Pause')) {
        return;
      }

      // Toggle play/pause
      if (playerRef.current) {
        setShowControls(true);
        setIsHovering(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }

        try {
          if (isPlaying) {
            await playerRef.current.pause();
            setIsPlaying(false);
            setShowControls(true);
          } else {
            await playerRef.current.play();
            setIsPlaying(true);
            controlsTimeoutRef.current = setTimeout(() => {
              setIsHovering(false);
              setShowControls(false);
            }, 3000);
          }
        } catch (err) {
          console.error("Error toggling play/pause:", err);
        }
      }
    };

    // Gérer les mouvements de souris en mode plein écran
    const handleFullscreenMouseMove = () => {
      setShowControls(true);
      setIsHovering(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setIsHovering(false);
          setShowControls(false);
        }, 3000);
      }
    };

    document.addEventListener('click', handleFullscreenClick);
    document.addEventListener('mousemove', handleFullscreenMouseMove);

    return () => {
      document.removeEventListener('click', handleFullscreenClick);
      document.removeEventListener('mousemove', handleFullscreenMouseMove);
    };
  }, [isFullscreen, isPlaying, isHovering]);

  // Gérer le hover sur la vidéo
  const handleVideoMouseEnter = () => {
    setIsHovering(true);
    setShowControls(true);
    // Annuler le timeout quand on entre
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handleVideoMouseLeave = () => {
    // Masquer les contrôles seulement si la vidéo joue
    if (isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      // Petit délai avant de vérifier si on est toujours en train de survoler la navbar
      controlsTimeoutRef.current = setTimeout(() => {
        // Vérifier qu'on n'est toujours pas en train de survoler
        if (!isHovering) {
          setShowControls(false);
        }
      }, 1000); // Délai de 1 seconde
    }
    // Mettre à jour isHovering après un petit délai pour permettre le passage vers la navbar
    setTimeout(() => {
      setIsHovering(false);
    }, 100);
  };

  // Gérer le hover sur la navbar pour la garder visible
  const handleNavbarMouseEnter = () => {
    setIsHovering(true);
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handleNavbarMouseLeave = () => {
    setIsHovering(false);
    // Masquer les contrôles seulement si la vidéo joue
    if (isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  };

  // Gérer le clic sur l'écran pour play/pause
  const handleVideoClick = async () => {
    if (!playerRef.current) return;

    // Afficher les contrôles au clic
    setShowControls(true);
    setIsHovering(true);

    // Annuler le timeout précédent si il existe
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    try {
      if (isPlaying) {
        await playerRef.current.pause();
        setIsPlaying(false);
        // Si on met en pause, garder les contrôles visibles
        setShowControls(true);
      } else {
        await playerRef.current.play();
        setIsPlaying(true);
        // Si on joue, masquer les contrôles après 3 secondes seulement si on ne survole pas
        if (!isHovering) {
          controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
          }, 3000);
        }
      }
    } catch (err) {
      console.error("Error toggling play/pause:", err);
    }
  };

  // Gérer le toggle du son
  const handleToggleMute = async (e) => {
    e?.stopPropagation();
    if (!playerRef.current) return;

    try {
      if (isMuted) {
        await playerRef.current.setVolume(1);
        setIsMuted(false);
      } else {
        await playerRef.current.setVolume(0);
        setIsMuted(true);
      }
      // Réafficher les contrôles quand on change le son
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Error toggling mute:", err);
    }
  };

  // Nettoyer le timeout au démontage
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Log de l'état actuel du spacing avec détails
  console.log('VideoList render - current spacing state:', {
    navbarSpacing: `${spacing.navbarSpacing.toFixed(2)}px`,
    videoSpacing: `${spacing.videoSpacing.toFixed(2)}px`,
    horizontalMargin: `${spacing.horizontalMargin.toFixed(2)}px`,
    videoHeight: `${spacing.videoHeight.toFixed(2)}px`
  });

  return (
    <div
      ref={containerRef}
      className="w-full max-w-full"
      style={{
        boxSizing: 'border-box',
        overflow: 'hidden', // Pas de scroll
        paddingBottom: `${spacing.bottomMargin}px`, // Marge en bas fixe (18px mobile, 28px desktop)
        height: '100vh', // Hauteur totale de la fenêtre
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        position: 'relative'
      }}
    >
      {error ? (
        <div className="text-red-500 text-center">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Espacement Navbar → Video - proportionnel */}
          <div
            style={{
              height: `${spacing.navbarSpacing}px`,
              backgroundColor: 'transparent' // Pour forcer l'application du style
            }}
            data-debug-spacing={spacing.navbarSpacing}
          />

          <div
            className="source-sans-light flex flex-col md:flex-row md:gap-6 md:items-start w-full"
            style={{
              paddingLeft: spacing.isMobile ? '0' : `${spacing.horizontalMargin}px`,
              paddingRight: spacing.isMobile ? '0' : `${spacing.horizontalMargin}px`,
              boxSizing: 'border-box' // Inclure le padding dans la largeur totale
            }}
            data-debug-margin={spacing.horizontalMargin}
          >
            {/* Player principal */}
            <div
              className="md:border-none relative flex-shrink-0"
              style={{
                width: '100%',
                maxWidth: spacing.isMobile ? '100%' : `${(spacing.videoHeight * 16) / 9}px`,
                paddingLeft: spacing.isMobile ? `${spacing.horizontalMargin}px` : '0',
                paddingRight: spacing.isMobile ? `${spacing.horizontalMargin}px` : '0',
                boxSizing: 'border-box',
                position: 'relative' // S'assurer que le positionnement absolu des enfants fonctionne
              }}
            >
              {selectedVideo && selectedVideo.url ? (
                <>
                  <div
                    ref={videoContainerRef}
                    className="overflow-hidden roar-blue relative w-full cursor-pointer"
                    style={{
                      height: isFullscreen ? '100vh' : `${spacing.videoHeight}px`,
                      width: isFullscreen ? '100vw' : '100%',
                      maxWidth: isFullscreen ? '100vw' : (spacing.isMobile ? '100%' : `${(spacing.videoHeight * 16) / 9}px`),
                      boxSizing: 'border-box',
                      position: 'relative', // Position relative pour les boutons absolus à l'intérieur
                      backgroundColor: isFullscreen ? '#000' : 'transparent',
                      display: isFullscreen ? 'flex' : 'block',
                      alignItems: isFullscreen ? 'center' : 'flex-start',
                      justifyContent: isFullscreen ? 'center' : 'flex-start'
                    }}
                    onClick={handleVideoClick}
                    onMouseEnter={handleVideoMouseEnter}
                    onMouseLeave={handleVideoMouseLeave}
                    onMouseMove={(e) => {
                      // Aussi réafficher les contrôles en mode plein écran au mouvement de la souris
                      if (isFullscreen) {
                        setShowControls(true);
                        setIsHovering(true);
                        if (controlsTimeoutRef.current) {
                          clearTimeout(controlsTimeoutRef.current);
                        }
                        if (isPlaying) {
                          controlsTimeoutRef.current = setTimeout(() => {
                            setIsHovering(false);
                            setShowControls(false);
                          }, 3000);
                        }
                      }
                    }}
                  >
                    <iframe
                      ref={videoRef}
                      key={selectedVideo.id}
                      src={`${selectedVideo.url}?autoplay=0&loop=1&muted=0&controls=0`}
                      className={isFullscreen ? "pointer-events-none" : "absolute top-0 left-0 w-full h-full pointer-events-none"}
                      style={{
                        zIndex: 1, // Z-index bas pour que la navbar passe au-dessus
                        width: isFullscreen ? fullscreenVideoDimensions.width : '100%',
                        height: isFullscreen ? fullscreenVideoDimensions.height : '100%',
                        objectFit: isFullscreen ? 'contain' : 'cover',
                        maxWidth: isFullscreen ? '100vw' : 'none',
                        maxHeight: isFullscreen ? '100vh' : 'none'
                      }}
                      frameBorder="0"
                      allow="autoplay; picture-in-picture"
                      title={selectedVideo.title}
                    />

                    {/* Navbar en bas - Mode normal */}
                    {!isFullscreen && (
                      <div
                        className={`${showControls || !isPlaying || isHovering ? 'opacity-100' : 'opacity-0'}`}
                        style={{
                          padding: '0.1rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          position: 'absolute',
                          bottom: '0',
                          left: '0',
                          right: '0',

                          transition: 'opacity 0.3s ease-in-out',
                          zIndex: 15,
                          pointerEvents: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={handleNavbarMouseEnter}
                        onMouseLeave={handleNavbarMouseLeave}
                      >
                        {/* Barre de progression */}
                        <div
                          className="relative flex-1 h-[1px] bg-gray-600 cursor-pointer rounded-full overflow-hidden"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (playerRef.current) {
                              const rect = e.target.getBoundingClientRect();
                              const clickPosition = e.clientX - rect.left;

                              try {
                                const duration = await playerRef.current.getDuration();
                                if (duration && duration > 0) {
                                  const newTime = (clickPosition / rect.width) * duration;
                                  if (newTime >= 0 && newTime <= duration) {
                                    await playerRef.current.setCurrentTime(newTime);
                                    // Réafficher les contrôles après un clic sur la barre
                                    setShowControls(true);
                                    if (controlsTimeoutRef.current) {
                                      clearTimeout(controlsTimeoutRef.current);
                                    }
                                    if (isPlaying) {
                                      controlsTimeoutRef.current = setTimeout(() => {
                                        setShowControls(false);
                                      }, 3000);
                                    }
                                  }
                                }
                              } catch (err) {
                                console.error("Error setting time:", err);
                              }
                            }
                          }}
                        >
                          <div
                            className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>

                        {/* Bouton Son */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleMute(e);
                          }}
                          className="hover:scale-110 transition-transform bg-transparent border-none cursor-pointer flex items-center justify-center flex-shrink-0"
                          style={{
                            pointerEvents: 'auto',
                            padding: '0.25rem'
                          }}
                        >
                          {isMuted ? (
                            <img
                              src="/images/soundoff.png"
                              alt="Son coupé"
                              className="w-[10px] h-[10px] md:w-[15px] md:h-[15px]"
                              style={{ display: 'block' }}
                            />
                          ) : (
                            <img
                              src="/images/soundon.png"
                              alt="Son activé"
                              className="w-[10px] h-[10px] md:w-[15px] md:h-[15px]"
                              style={{ display: 'block' }}
                            />
                          )}
                        </button>

                        {/* Bouton Fullscreen */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFullscreen();
                          }}
                          className="hover:scale-110 transition-transform bg-transparent border-none cursor-pointer flex items-center justify-center flex-shrink-0"
                          style={{
                            pointerEvents: 'auto',
                            padding: '0.25rem'
                          }}
                        >
                          {isFullscreen ? (
                            <img
                              src="/images/reduce.png"
                              alt="Réduire"
                              className="w-[15px] h-[20px] md:w-[20px] md:h-[20px]"
                              style={{ display: 'block' }}
                            />
                          ) : (
                            <img
                              src="/images/grow.png"
                              alt="Plein écran"
                              className="w-[15px] h-[20px] md:w-[20px] md:h-[20px]"
                              style={{ display: 'block' }}
                            />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Play button - Toujours visible quand la vidéo est en pause ou terminée */}
                  {!isPlaying && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVideoClick();
                      }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform z-10 bg-transparent border-none cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <img
                        src="/images/play.png"
                        alt="Play"
                        className="w-[60px] h-[60px] md:w-[80px] md:h-[80px]"
                      />
                    </button>
                  )}

                  {/* Pause button - Visible seulement après un clic sur l'écran pendant la lecture */}
                  {isPlaying && showControls && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVideoClick();
                      }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform z-10 bg-transparent border-none cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <img
                        src="/images/pause.png"
                        alt="Pause"
                        className="w-[60px] h-[60px] md:w-[80px] md:h-[80px]"
                      />
                    </button>
                  )}

                </>
              ) : (
                <div className="flex items-center justify-center h-[12.5rem] md:h-[30.1875rem] bg-gray-200">
                  <p>Loading video...</p>
                </div>
              )}
            </div>

            {/* Infos vidéo */}
            <div className="w-full m-[18px] mb-[0px] md:w-[20.83vw] flex flex-col justify-start font-HelveticaNeue font-light mt-4 md:mt-0 md:ml-[1.125rem] md:mt-[1.125rem] flex-shrink-0 text-grey-dark" style={{ boxSizing: 'border-box' }}>
              <h3 className="text-2xl md:text-[1.25rem] font-[500] " style={{ fontFamily: "'HelveticaNeue', 'Helvetica', 'Arial', sans-serif" }}>
                {selectedVideo?.title}
              </h3>
              <p className="text-sm font-HelveticaNeue md:text-[1.25rem] md:mb-[2.41375rem] md:mt-[0.75rem] font-style: italic" style={{ fontFamily: "'HelveticaNeue', 'Helvetica', 'Arial', sans-serif" }}>
                {selectedVideo?.soustitre}
              </p>
              <p className="text-sm font-HelveticaNeue font-[300] md:text-[1.25rem] " style={{ fontFamily: "'HelveticaNeue', 'Helvetica', 'Arial', sans-serif" }}>
                {selectedVideo?.description}
              </p>
            </div>
          </div>

          {/* Espacement Video → Carrousel - variable, s'adapte pour que tout tienne dans 100vh */}
          <div
            style={{
              height: `${spacing.carouselSpacing}px`, // Espacement dynamique calculé
              backgroundColor: 'transparent'
            }}
          />

          {/* Carrousel des vidéos */}
          <div
            className="w-full"
            style={{
              paddingLeft: `${spacing.horizontalMargin}px`,
              paddingRight: `${spacing.horizontalMargin}px`,
              boxSizing: 'border-box'
            }}
          >
            <Carousel
              videos={videos}
              onSelectVideo={setSelectedVideo}
              selectedVideo={selectedVideo}
            />
          </div>

        </>
      )}

      {/* Navbar en mode plein écran - Rendu via Portal dans le body */}
      {isFullscreen && typeof document !== 'undefined' && createPortal(
        <>
          {/* Bouton Play/Pause en mode plein écran */}
          {!isPlaying && (
            <button
              data-fullscreen-play
              onClick={async (e) => {
                e.stopPropagation();
                if (playerRef.current) {
                  setShowControls(true);
                  setIsHovering(true);
                  try {
                    await playerRef.current.play();
                    setIsPlaying(true);
                    if (controlsTimeoutRef.current) {
                      clearTimeout(controlsTimeoutRef.current);
                    }
                    controlsTimeoutRef.current = setTimeout(() => {
                      setIsHovering(false);
                      setShowControls(false);
                    }, 3000);
                  } catch (err) {
                    console.error("Error playing video:", err);
                  }
                }
              }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2147483647,
                pointerEvents: 'auto',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <img
                src="/images/play.png"
                alt="Play"
                className="w-[60px] h-[60px] md:w-[80px] md:h-[80px]"
                style={{ display: 'block' }}
              />
            </button>
          )}

          {isPlaying && showControls && (
            <button
              data-fullscreen-pause
              onClick={async (e) => {
                e.stopPropagation();
                if (playerRef.current) {
                  setShowControls(true);
                  setIsHovering(true);
                  try {
                    await playerRef.current.pause();
                    setIsPlaying(false);
                  } catch (err) {
                    console.error("Error pausing video:", err);
                  }
                }
              }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2147483647,
                pointerEvents: 'auto',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <img
                src="/images/pause.png"
                alt="Pause"
                className="w-[60px] h-[60px] md:w-[80px] md:h-[80px]"
                style={{ display: 'block' }}
              />
            </button>
          )}

          {/* Navbar */}
          <div
            data-fullscreen-navbar
            className={(!isPlaying || showControls || isHovering) ? 'opacity-100' : 'opacity-0'}
            style={{
              position: 'fixed',
              bottom: '0',
              left: '0',
              right: '0',
              padding: '0.1rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              transition: 'opacity 0.3s ease-in-out',
              zIndex: 2147483647, // Z-index maximum pour être au-dessus de tout
              pointerEvents: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={handleNavbarMouseEnter}
            onMouseLeave={handleNavbarMouseLeave}
          >
            {/* Barre de progression */}
            <div
              className="relative flex-1 h-1 bg-grey-600 cursor-pointer rounded-full overflow-hidden"
              onClick={async (e) => {
                e.stopPropagation();
                if (playerRef.current) {
                  const rect = e.target.getBoundingClientRect();
                  const clickPosition = e.clientX - rect.left;

                  try {
                    const duration = await playerRef.current.getDuration();
                    if (duration && duration > 0) {
                      const newTime = (clickPosition / rect.width) * duration;
                      if (newTime >= 0 && newTime <= duration) {
                        await playerRef.current.setCurrentTime(newTime);
                        setShowControls(true);
                        if (controlsTimeoutRef.current) {
                          clearTimeout(controlsTimeoutRef.current);
                        }
                        if (isPlaying) {
                          controlsTimeoutRef.current = setTimeout(() => {
                            if (!isHovering) {
                              setShowControls(false);
                            }
                          }, 3000);
                        }
                      }
                    }
                  } catch (err) {
                    console.error("Error setting time:", err);
                  }
                }
              }}
            >
              <div
                className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Bouton Son */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMute(e);
              }}
              className="hover:scale-110 transition-transform bg-transparent border-none cursor-pointer flex items-center justify-center flex-shrink-0"
              style={{
                pointerEvents: 'auto',
                padding: '0.25rem'
              }}
            >
              {isMuted ? (
                <img
                  src="/images/soundoff.png"
                  alt="Son coupé"
                  className="w-[15px] h-[20px] md:w-[20px] md:h-[20px]"
                  style={{ display: 'block' }}
                />
              ) : (
                <img
                  src="/images/soundon.png"
                  alt="Son activé"
                  className="w-[15px] h-[20px] md:w-[20px] md:h-[20px]"
                  style={{ display: 'block' }}
                />
              )}
            </button>

            {/* Bouton Fullscreen */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFullscreen();
              }}
              className="hover:scale-110 transition-transform bg-transparent border-none cursor-pointer flex items-center justify-center flex-shrink-0"
              style={{
                pointerEvents: 'auto',
                padding: '0.25rem'
              }}
            >
              {isFullscreen ? (
                <img
                  src="/images/reduce.png"
                  alt="Réduire"
                  className="w-[15px] h-[20px] md:w-[20px] md:h-[20px]"
                  style={{ display: 'block' }}
                />
              ) : (
                <img
                  src="/images/grow.png"
                  alt="Plein écran"
                  className="w-[15px] h-[20px] md:w-[20px] md:h-[20px]"
                  style={{ display: 'block' }}
                />
              )}
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
