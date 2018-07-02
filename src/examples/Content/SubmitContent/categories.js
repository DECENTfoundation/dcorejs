const categories = [
    {
        name: 'Music',
        subcategory: [
            {
                name: 'Alternative/Indie',
                id: '1.1.1'
            },
            {
                name: 'Blues',
                id: '1.1.2'
            },
            {
                name: 'Children\'s Music',
                id: '1.1.3'
            },
            {
                name: 'Christian/Gospel',
                id: '1.1.4'
            },
            {
                name: 'Classical',
                id: '1.1.5'
            },
            {
                name: 'Comedy/SpokenWord/Other',
                id: '1.1.6'
            },
            {
                name: 'Country',
                id: '1.1.7'
            },
            {
                name: 'Dance/Electronic',
                id: '1.1.8'
            },
            {
                name: 'Folk',
                id: '1.1.9'
            },
            {
                name: 'Hip-Hop/Rap',
                id: '1.1.10'
            },
            {
                name: 'Holiday',
                id: '1.1.11'
            },
            {
                name: 'Jazz',
                id: '1.1.12'
            },
            {
                name: 'Metal',
                id: '1.1.13'
            },
            {
                name: 'Pop',
                id: '1.1.14'
            },
            {
                name: 'R&B/Soul',
                id: '1.1.15'
            },
            {
                name: 'Reggae',
                id: '1.1.16'
            },
            {
                name: 'Rock',
                id: '1.1.17'
            },
            {
                name: 'Soundtracks',
                id: '1.1.18'
            },
            {
                name: 'Vocal/Easy Listening',
                id: '1.1.19'
            },
            {
                name: 'World',
                id: '1.1.20'
            },
            {
                name: 'Fitness & Workout',
                id: '1.1.21'
            },
            {
                name: 'Other',
                id: '1.1.22'
            }
        ],
        id: '1.1'
    },
    {
        name: 'Movies',
        subcategory: [
            {
                name: 'Action & Adventure',
                id: '1.2.1'
            },
            {
                name: 'Animation',
                id: '1.2.2'
            },
            {
                name: 'Comedy',
                id: '1.2.3'
            },
            {
                name: 'Documentary',
                id: '1.2.4'
            },
            {
                name: 'Drama',
                id: '1.2.5'
            },
            {
                name: 'Family',
                id: '1.2.6'
            },
            {
                name: 'Horror',
                id: '1.2.7'
            },
            {
                name: 'Music',
                id: '1.2.8'
            },
            {
                name: 'Sports',
                id: '1.2.9'
            },
            {
                name: 'Other',
                id: '1.2.10'
            }
        ],
        id: '1.2'
    },
    {
        name: 'Books',
        subcategory: [
            {
                name: 'Biographies & Memoirs',
                id: '1.3.1'
            },
            {
                name: 'Business & Investing',
                id: '1.3.2'
            },
            {
                name: 'Children\'s Books',
                id: '1.3.3'
            },
            {
                name: 'Computers & Technology',
                id: '1.3.4'
            },
            {
                name: 'Cooking, Food & Wine',
                id: '1.3.5'
            },
            {
                name: 'Fiction & Literature',
                id: '1.3.6'
            },
            {
                name: 'Health, Mind & Body',
                id: '1.3.7'
            },
            {
                name: 'History',
                id: '1.3.8'
            },
            {
                name: 'Mystery & Thrillers',
                id: '1.3.9'
            },
            {
                name: 'Politics & Current Events',
                id: '1.3.10'
            },
            {
                name: 'Religion & Spirituality',
                id: '1.3.11'
            },
            {
                name: 'Romance',
                id: '1.3.12'
            },
            {
                name: 'Science Fiction & Fantasy',
                id: '1.3.13'
            },
            {
                name: 'Crime',
                id: '1.3.14'
            },
            {
                name: 'Comics',
                id: '1.3.15'
            },
            {
                name: 'Other',
                id: '1.3.16'
            }
        ],
        id: '1.3'
    },
    {
        name: 'Audiobooks',
        subcategory: [
            {
                name: 'Biographies & Memoirs',
                id: '1.4.1'
            },
            {
                name: 'Business & Investing',
                id: '1.4.2'
            },
            {
                name: 'Children\'s Books',
                id: '1.4.3'
            },
            {
                name: 'Computers & Technology',
                id: '1.4.4'
            },
            {
                name: 'Cooking, Food & Wine',
                id: '1.4.5'
            },
            {
                name: 'Fiction & Literature',
                id: '1.4.6'
            },
            {
                name: 'Health, Mind & Body',
                id: '1.4.7'
            },
            {
                name: 'History',
                id: '1.4.8'
            },
            {
                name: 'Mystery & Thrillers',
                id: '1.4.9'
            },
            {
                name: 'Politics & Current Events',
                id: '1.4.10'
            },
            {
                name: 'Religion & Spirituality',
                id: '1.4.11'
            },
            {
                name: 'Romance',
                id: '1.4.12'
            },
            {
                name: 'Science Fiction & Fantasy',
                id: '1.4.13'
            },
            {
                name: 'Crime',
                id: '1.4.14'
            },
            {
                name: 'Comics',
                id: '1.4.15'
            },
            {
                name: 'Other',
                id: '1.4.16'
            }
        ],
        id: '1.4'
    },
    {
        name: 'Software',
        subcategory: [
            {
                name: 'Animation & Modeling',
                id: '1.5.1'
            },
            {
                name: 'Audio Production',
                id: '1.5.2'
            },
            {
                name: 'Design & Illustration',
                id: '1.5.3'
            },
            {
                name: 'Education',
                id: '1.5.4'
            },
            {
                name: 'Game Development',
                id: '1.5.5'
            },
            {
                name: 'Photo Editing',
                id: '1.5.6'
            },
            {
                name: 'Themes & Templates',
                id: '1.5.7'
            },
            {
                name: 'Utilities',
                id: '1.5.8'
            },
            {
                name: 'Video Production',
                id: '1.5.9'
            },
            {
                name: 'Web Publishing',
                id: '1.5.10'
            },
            {
                name: 'Other',
                id: '1.5.11'
            }
        ],
        id: '1.5'
    },
    {
        name: 'Games',
        subcategory: [
            {
                name: 'Action',
                id: '1.6.1'
            },
            {
                name: 'Adventure',
                id: '1.6.2'
            },
            {
                name: 'Arcade',
                id: '1.6.3'
            },
            {
                name: 'Board',
                id: '1.6.4'
            },
            {
                name: 'Card',
                id: '1.6.5'
            },
            {
                name: 'Casino',
                id: '1.6.6'
            },
            {
                name: 'Casual',
                id: '1.6.7'
            },
            {
                name: 'Educational',
                id: '1.6.8'
            },
            {
                name: 'Music',
                id: '1.6.9'
            },
            {
                name: 'Puzzle',
                id: '1.6.10'
            },
            {
                name: 'Racing',
                id: '1.6.11'
            },
            {
                name: 'Role Playing',
                id: '1.6.12'
            },
            {
                name: 'Simulation',
                id: '1.6.13'
            },
            {
                name: 'Sports',
                id: '1.6.14'
            },
            {
                name: 'Strategy',
                id: '1.6.15'
            },
            {
                name: 'Trivia',
                id: '1.6.16'
            },
            {
                name: 'Word',
                id: '1.6.17'
            },
            {
                name: 'Indie',
                id: '1.6.18'
            },
            {
                name: 'RPG',
                id: '1.6.19'
            },
            {
                name: 'Other',
                id: '1.6.20'
            }
        ],
        id: '1.6'
    },
    {
        name: 'Pictures',
        subcategory: [
            {
                name: 'General',
                id: '1.7.1'
            },
            {
                name: 'Nature',
                id: '1.7.2'
            },
            {
                name: 'Macro',
                id: '1.7.3'
            },
            {
                name: 'Portrait',
                id: '1.7.4'
            },
            {
                name: 'Nude',
                id: '1.7.5'
            },
            {
                name: 'Sports',
                id: '1.7.6'
            },
            {
                name: 'Architecture',
                id: '1.7.7'
            },
            {
                name: 'Astrophotography',
                id: '1.7.8'
            },
            {
                name: 'Other',
                id: '1.7.9'
            }
        ],
        id: '1.7'
    },
    {
        name: 'Documents',
        subcategory: [
            {
                name: 'Academia',
                id: '1.8.1'
            },
            {
                name: 'Business',
                id: '1.8.2'
            },
            {
                name: 'Government/Law/Politics',
                id: '1.8.3'
            },
            {
                name: 'Other',
                id: '1.8.4'
            }
        ],
        id: '1.8'
    }
];
